async function scanCrop() {
  const fileInput = document.getElementById("crop-image");
  const cropImage = fileInput.value; // For prototype, URL or path

  const response = await fetch("http://localhost:3000/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cropImage })
  });

  const data = await response.json();
  document.getElementById("scan-result").innerText = `Result: ${data.result}`;
}