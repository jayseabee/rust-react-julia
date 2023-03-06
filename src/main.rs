use actix_web::{App, HttpServer, HttpRequest, HttpResponse, Error, get, web, Responder, Result};
use actix_web::middleware::Logger;
use actix_cors::Cors;
use actix_rt;

mod handler;

mod julia;
use julia::{JuliaParams, julia_generate};

use serde::Serialize;
use serde::Deserialize;
use env_logger::Env;

#[derive(Serialize)]
struct ApiData {
    status: String,
    data: Vec<u8>
}
#[derive(Debug, Deserialize)]
pub enum ResponseType {
   Token,
   Code
}

async fn echo_ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let (res, session, msg_stream) = actix_ws::handle(&req, stream)?;

    // spawn websocket handler (and don't await it) so that the response is returned immediately
    actix_rt::spawn(handler::echo_ws(session, msg_stream));

    Ok(res)
}

#[get("/julia-image")]
async fn get_julia_image(query: web::Query<JuliaParams>) -> Result<impl Responder> {

    let data = julia_generate(&query.into_inner());

    let obj = ApiData {
        status: "healthy".to_string(),
        data: data
    };
    Ok(web::Json(obj))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    env_logger::init_from_env(Env::default().default_filter_or("info"));

    HttpServer::new(|| { 

        let cors = Cors::permissive();

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .wrap(Logger::new("%a %{User-Agent}i"))
            .service(get_julia_image)
            .service(web::resource("/ws").route(web::get().to(echo_ws)))
            
        }) 
        .bind(("127.0.0.1", 8080))?
        .run()
        .await
}