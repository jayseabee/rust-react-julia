extern crate image;
use serde::Deserialize;

#[derive(Clone, Debug, Deserialize)]
pub struct JuliaParams {
   pub width: u32,
   pub height: u32,
   pub cx: f32,
   pub cy: f32,
}

// Modified from:
// https://rosettacode.org/wiki/Julia_set#Rust
pub fn julia_generate(params: &JuliaParams) -> Vec<u8> {

    let mut ret = Vec::<u8>::new();
    let iterations = 280;

    for y in 0..params.height {
        for x in 0..params.width {
            let inner_height = params.height as f32;
            let inner_width = params.width as f32;
            let inner_y = y as f32;
            let inner_x = x as f32;

            let mut zx = 3.0 * (inner_x - 0.5 * inner_width) / (inner_width);
            let mut zy = 2.0 * (inner_y - 0.5 * inner_height) / (inner_height);

            let mut i = iterations;

            while zx * zx + zy * zy < 4.0 && i > 1 {
                let tmp = zx * zx - zy * zy + params.cx;
                zy = 2.0 * zx * zy + params.cy;
                zx = tmp;
                i -= 1;
            }

            // guesswork to make the rgb color values look okay
            // you can play with the bit shifting to change colors
            // but iterations also affect that
            ret.push((i << 1) as u8);
            ret.push((i << 2) as u8);
            ret.push((i << 3) as u8);
            ret.push(255);
        }
    }

    ret
}

// You can use this test function to save a specific julia
// set to a high res image:
// Also see here for some interesting regions:
// https://www.karlsims.com/julia.html

#[cfg(test)]
mod tests {
    use super::*;
    use image::{ImageBuffer, Rgb};
    use std::time::{Instant};
    use rand::{distributions::Uniform, Rng};

    fn save_image(rgb: Vec<u8>, width: u32, height: u32, fname: String) -> bool {
        let mut img = ImageBuffer::new(width as u32, height as u32);
        let mut idx:usize = 0;
        for y in 0..height {
            for x in 0..width {
                let pixel = Rgb([
                    rgb[idx] as u8, rgb[idx+1] as u8, rgb[idx+2] as u8
                ]);
                idx += 4; // its encoded as rgba
                img.put_pixel(x as u32, y as u32, pixel);
            }
        }
        img.save(fname).is_ok()
    }

    #[test]
    fn julia_save_png() {
        let start = Instant::now();

        let params = JuliaParams {
            width: 800,
            height: 500,
            cx: -0.758089028239593,
            cy: 0.05543246580171968,
        };
        let v = julia_generate(&params);
        println!("Julia set generation: cx: {:.3}, cy: {:.3}, time: {:.2?}", 
            params.cx, params.cy, start.elapsed());

        assert!(save_image(v, params.width, params.height, "julia-set.png".to_string()));
    }

    #[test]
    fn julia_speed() {

        let mut params = JuliaParams {
            width: 800,
            height: 500,
            cx: 0.0,
            cy: 0.0
        };

        let mut rng = rand::thread_rng();
        let cx_range = Uniform::new(-0.9, 0.9);
        let cy_range = Uniform::new(-0.9, 0.9);

        for _i in 0..10 {
            params.cx = rng.sample(&cx_range);
            params.cy = rng.sample(&cy_range);
            let start = Instant::now();
            let _v = julia_generate(&params);
            println!("Julia set generation: cx: {:.3}, cy: {:.3}, time: {:.2?}", 
                params.cx, params.cy, start.elapsed());
        }

        assert!(true);
    }
}