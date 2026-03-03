const learningContent = [
  { id: 1, title: "Maize Farming Tips", content: "Plant in well-drained soil, irrigate regularly, watch for pests." },
  { id: 2, title: "Tomato Care Guide", content: "Use staking, prune excess leaves, monitor for fungal infections." },
  { id: 3, title: "Organic Fertilizers", content: "Compost, manure, and crop rotation increase yield sustainably." }
];

exports.getLearning = async (req, res) => {
  try {
    res.json(learningContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};