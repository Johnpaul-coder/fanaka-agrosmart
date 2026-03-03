exports.scanDisease = async (req, res) => {
  try {
    const { cropImage } = req.body; // Just URL or base64
    // Placeholder logic
    const diseases = ["Healthy", "Fungal Infection", "Pest Damage"];
    const randomIndex = Math.floor(Math.random() * diseases.length);
    res.json({ cropImage, result: diseases[randomIndex] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};