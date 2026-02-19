const frame = document.getElementById("tasks-frame");
const fallback = document.getElementById("fallback");

frame.addEventListener("error", () => {
  frame.style.display = "none";
  fallback.style.display = "block";
});
