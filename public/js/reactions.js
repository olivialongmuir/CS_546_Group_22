// adding event listener to update the stats
document.addEventListener("click", async (e) => {

  const btn = e.target.closest(".vote-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  const type = btn.dataset.type;
  const target = btn.dataset.target;


  try {
    const res = await fetch(`/${target}/${id}/${type}`, {
      method: "POST"
    });


    const data = await res.json();

    if (!data.success) {
      alert(data.error || "Error updating reaction");
      return;
    }

    document.getElementById(`likes-${id}`).textContent = data.stats.likes ?? 0;
    document.getElementById(`dislikes-${id}`).textContent = data.stats.dislikes ?? 0;

  } catch (err) {
    console.error(err);
  }
});


// adding event listener to delete a comment
document.querySelectorAll(".delete-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const id = btn.dataset.id;

    if (!confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`/comments/${id}/delete`, {
        method: "POST"
      });

      if (!res.ok) throw new Error("Delete failed");

      // remove comment from app
      btn.closest(".comment-item").remove();

    } catch (err) {
      console.error(err);
      alert("Could not delete comment");
    }
  });
});