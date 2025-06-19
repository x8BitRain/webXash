const setCanvasLoading = () => {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;
  canvas.className += " " + "loading";
};

export default setCanvasLoading;
