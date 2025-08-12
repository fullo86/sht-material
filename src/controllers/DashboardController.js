const Dashboard = async (req, res) => {
  return res.render('dashboard/read', {
    layout: 'layouts/template',
    title: 'Dashboard',
  });
};

module.exports = Dashboard