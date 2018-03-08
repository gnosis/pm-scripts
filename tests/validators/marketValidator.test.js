import MarketValidator from '../../src/validators/marketValidator'
import { validCategoricalMarket, validScalarMarket, getValidDate } from '../helpers/market'
import expect from 'expect.js'

describe('Market Validator', () => {
  it('Empty market object', () => {
    expect(new MarketValidator({}).isValid).to.throwException()
  })
  it('Categorical Market is valid', () => {
    expect(new MarketValidator(validCategoricalMarket).isValid()).to.be(true)
  })
  it('Scalar Market is valid', () => {
    expect(new MarketValidator(validScalarMarket).isValid()).to.be(true)
  })
  it('Market title', () => {
    const market = Object.assign({}, validCategoricalMarket)
    market.title = undefined
    expect(new MarketValidator(market).isValid).to.throwException()
    market.title = null
    expect(new MarketValidator(market).isValid).to.throwException()
    market.title = ''
    expect(new MarketValidator(market).isValid).to.throwException()
    market.title = 'something'
    expect(new MarketValidator(market).isValid()).to.be(true)
  })
  it('Market description', () => {
    const market = Object.assign({}, validCategoricalMarket)
    market.description = undefined
    expect(new MarketValidator(market).isValid).to.throwException()
    market.description = null
    expect(new MarketValidator(market).isValid).to.throwException()
    market.description = ''
    expect(new MarketValidator(market).isValid).to.throwException()
    market.description = 'something'
    expect(new MarketValidator(market).isValid()).to.be(true)
  })
  it('Market resolution date', () => {
    const market = Object.assign({}, validCategoricalMarket)
    const validDate = getValidDate()
    market.resolutionDate = new Date().toISOString()
    expect(new MarketValidator(market).isValid).to.throwException()
    market.resolutionDate = null
    expect(new MarketValidator(market).isValid).to.throwException()
    market.resolutionDate = ''
    expect(new MarketValidator(market).isValid).to.throwException()
    market.resolutionDate = validDate.toISOString()
    expect(new MarketValidator(market).isValid()).to.be(true)
  })
  it('Market outcome type', () => {
    const market = Object.assign({}, validCategoricalMarket)
    market.outcomeType = undefined
    expect(new MarketValidator(market).isValid).to.throwException()
    market.outcomeType = null
    expect(new MarketValidator(market).isValid).to.throwException()
    market.outcomeType = ''
    expect(new MarketValidator(market).isValid).to.throwException()
    market.outcomeType = 'CATEGORICAL'
    expect(new MarketValidator(market).isValid()).to.be(true)
  })
  it('Market fee', () => {
    const market = Object.assign({}, validCategoricalMarket)
    market.fee = undefined
    expect(new MarketValidator(market).isValid).to.throwException()
    market.fee = null
    expect(new MarketValidator(market).isValid).to.throwException()
    market.fee = ''
    expect(new MarketValidator(market).isValid).to.throwException()
    market.fee = -1
    expect(new MarketValidator(market).isValid).to.throwException()
    market.fee = '1'
    expect(new MarketValidator(market).isValid()).to.be(true)
    market.fee = 1
    expect(new MarketValidator(market).isValid()).to.be(true)
    market.fee = 10.5
    expect(new MarketValidator(market).isValid).to.throwException()
  })
  it('Market funding', () => {
    const market = Object.assign({}, validCategoricalMarket)
    market.funding = undefined
    expect(new MarketValidator(market).isValid).to.throwException()
    market.funding = null
    expect(new MarketValidator(market).isValid).to.throwException()
    market.funding = ''
    expect(new MarketValidator(market).isValid).to.throwException()
    market.funding = 0
    expect(new MarketValidator(market).isValid).to.throwException()
    market.funding = 100
    expect(new MarketValidator(market).isValid()).to.be(true)
  })
  it('Market categorical outcomes', () => {
    const market = Object.assign({}, validCategoricalMarket)
    market.outcomes = undefined
    expect(new MarketValidator(market).isValid).to.throwException()
    market.outcomes = null
    expect(new MarketValidator(market).isValid).to.throwException()
    market.outcomes = ''
    expect(new MarketValidator(market).isValid).to.throwException()
    market.outcomes = []
    expect(new MarketValidator(market).isValid).to.throwException()
    market.outcomes = ['Yes']
    expect(new MarketValidator(market).isValid).to.throwException()
    market.outcomes = ['Yes', 'No']
    expect(new MarketValidator(market).isValid()).to.be(true)
  })
  it('Market scalar bounds', () => {
    const market = Object.assign({}, validScalarMarket)
    market.upperBound = undefined
    expect(new MarketValidator(market).isValid).to.throwException()
    market.upperBound = null
    expect(new MarketValidator(market).isValid).to.throwException()
    market.upperBound = ''
    expect(new MarketValidator(market).isValid).to.throwException()
    market.upperBound = 0
    expect(new MarketValidator(market).isValid).to.throwException()
    market.upperBound = market.lowerBound - 1
    expect(new MarketValidator(market).isValid).to.throwException()
    market.upperBound = market.lowerBound + 100
    expect(new MarketValidator(market).isValid()).to.be(true)
  })
})
