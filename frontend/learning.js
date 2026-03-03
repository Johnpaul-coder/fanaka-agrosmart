async function fetchLearning() {
  const response = await fetch("http://localhost:3000/learning");
  const data = await response.json();
  const container = document.getElementById("learning-container");
  container.innerHTML = "";
  data.forEach(item => {
    const card = document.createElement("div");
    card.innerHTML = `<h3>${item.title}</h3><p>${item.content}</p>`;
    container.appendChild(card);
  });
}

window.onload = fetchLearning;