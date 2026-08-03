function getJwtSecret() {
  return process.env.JWT_SECRET || 'knoll_dev_secret_change_me';
}

module.exports = { getJwtSecret };
