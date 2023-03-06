// Create a function declaration so you can
// use it in useEffect hooks

const putImage = async function (canvasRef, image) {
  try {
    const canvas = canvasRef.current;
    if (canvas && image) {
      // in case the canvas hasn't been setup yet
      const context = canvas.getContext("2d");

      let canvasData = await context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      for (let i = 0; i < canvasData.data.length; i++) {
        canvasData.data[i] = image.data[i];
      }

      context.putImageData(canvasData, 0, 0);
    }
  } catch (error) {
    console.error(error);
  }
};

export default putImage;
