const getValidDate = () => {
  const validDate = new Date()
  validDate.setDate(validDate.getDate() + 1)
  validDate.setHours(0, 0, 0, 0)
  return validDate
}

const validBaseMarket = {
  'title': 'Will this market pass validation?',
  'description': 'A test market',
  'resolutionDate': getValidDate().toISOString(),
  'currency': 'ETH',
  'fee': '0',
  'funding': '500e18'
}

const validCategoricalMarket = Object.assign({
  'outcomeType': 'CATEGORICAL',
  'outcomes': ['Yes', 'No']
}, validBaseMarket)

const validScalarMarket = Object.assign({
  'outcomeType': 'SCALAR',
  'upperBound': '10',
  'lowerBound': '5',
  'unit': 'WETH',
  'decimals': 0
}, validBaseMarket)

const categoricalEventDescription = {
  'title': 'Will this market pass validation?',
  'description': 'A test market',
  'resolutionDate': getValidDate().toISOString(),
  'outcomes': ['Yes', 'No']
}

const scalarEventDescription = {
  'title': 'Will this market pass validation?',
  'description': 'A test market',
  'resolutionDate': getValidDate().toISOString(),
  'upperBound': '10',
  'lowerBound': '5',
  'unit': 'WETH',
  'decimals': 0
}

const defaultGas = 300000000

module.exports = {
  getValidDate,
  validBaseMarket,
  validCategoricalMarket,
  validScalarMarket,
  categoricalEventDescription,
  scalarEventDescription,
  defaultGas
}
