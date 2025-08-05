const Dashboard = async (req, res) => {
  res.render('dashboard/read', {
    layout: 'layouts/template',
    title: 'Dashboard',
  });
};

module.exports = Dashboard