# PoolTogether Generic Minimal Proxy Factory

[![Coverage Status](https://coveralls.io/repos/github/pooltogether/pooltogether-proxy-factory/badge.svg?branch=master)](https://coveralls.io/github/pooltogether/pooltogether-proxy-factory?branch=master)

[![CircleCI](https://circleci.com/gh/pooltogether/pooltogether-proxy-factory.svg?style=svg)](https://circleci.com/gh/pooltogether/pooltogether-proxy-factory)

PoolTogether uses the EIP-1167 Minimal Proxy Factory throughout its contracts. This repo provides this contract pattern as a package for use in other repo's deployment scripts.

# Installation
Install the repo and dependencies by running:
`yarn`

## Deployment
These contracts can be deployed to a network by running:
`yarn deploy <networkName>`

# Testing
Run the unit tests locally with:
`yarn test`

## Coverage
Generate the test coverage report with:
`yarn coverage`