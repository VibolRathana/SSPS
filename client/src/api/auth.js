// PUT /api/auth/profile — update the logged-in user
export async function updateProfile(req, res) {
  try {
    const { fullName, email, major, phone, bio } = req.body;
    await User.update(
      { full_name: fullName, email, major, phone, bio },
      { where: { user_id: req.user.id } }
    );
    const u = await User.findByPk(req.user.id);
    res.json({
      message: "Profile updated",
      user: { id: u.user_id, fullName: u.full_name, email: u.email, role: u.role, major: u.major, phone: u.phone, bio: u.bio },
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError")
      return res.status(409).json({ message: "That email is already in use" });
    res.status(500).json({ message: err.message });
  }
}

// GET /api/auth/stats — real counts, default 0 when empty
export async function getStats(req, res) {
  try {
    const id = req.user.id;
    const [[t]] = await pool.query("SELECT COUNT(*) AS c FROM tasks WHERE user_id = ? AND status = 'Completed'", [id]);
    const [[h]] = await pool.query("SELECT COALESCE(SUM(hours),0) AS c FROM study_sessions WHERE user_id = ?", [id]);
    const [[a]] = await pool.query("SELECT COUNT(*) AS c FROM assignments WHERE user_id = ? AND status IN ('Submitted','Graded')", [id]);
    res.json({ tasksCompleted: t.c, studyHours: Number(h.c), achievements: a.c });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}