import React, { Component, useContext } from 'react'
import { gql } from 'apollo-boost'

const FiltersContext = React.createContext()

function pruneFilters(data) {
  return data.map(({ field, operator, value }) => ({
    field,
    operator,
    value
  }))
}

class FiltersProvider extends Component {
  // Context state
  state = {
    filters: []
  }

  // Method to update state
  setFilters = filters => {
    this.setState({ filters })
  }

  render() {
    const { children } = this.props
    const { filters } = this.state
    const { setFilters } = this

    return (
      <FiltersContext.Provider
        value={{
          filters: pruneFilters(filters),
          setFilters,
          conditions: filters
        }}
      >
        {children}
      </FiltersContext.Provider>
    )
  }
}

export { FiltersProvider }

export default FiltersContext
