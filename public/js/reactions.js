// adding event listener to update the stats

document.addEventListener("click", async (e) => {
  const btn = e.target.closest(".vote-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  const type = btn.dataset.type;

  try {
    const res = await fetch(`/comments/${id}/${type}`, {
      method: "POST"
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.error || "Error updating reaction");
      return;
    }

    // update the interface with the new stats
    document.getElementById(`likes-${id}`).textContent = data.stats.likes;
    document.getElementById(`dislikes-${id}`).textContent = data.stats.dislikes;

  } catch (err) {
    console.error(err);
  }
});