const capitalizeFirstLetter = value => {
  value = value.toLowerCase()
  return value.charAt(0).toUpperCase() + value.slice(1)
}

module.exports = {
  capitalizeFirstLetter
}
