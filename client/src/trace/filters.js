import React, { useContext, useState, useEffect, memo } from 'react'
import { gql } from 'apollo-boost'
import styles from './filters.module.css'
import FiltersContext from './filtersContext'
import client from '../client'

const TRACE_FILTER_OPTIONS = gql`
  query traceFilterOptions($graphId: ID!) {
    traceFilterOptions(graphId: $graphId) {
      clientName
      clientVersion
      schemaTag
    }
  }
`

const autoComplete = ({ setSuggestions, fields, trigger, setValue }) => {
  const matcher = value => value.match(/\w+:?(\S*)?/g)

  const completer = value => {
    const matches = matcher(value)
    if (matches) {
      const lastMatch = matches.pop()
      if (!lastMatch.includes(trigger)) {
        setSuggestions(fields.map(x => x.label).filter(x => x.startsWith(lastMatch)))
      } else {
        const [fieldLabel, valueName] = lastMatch.split(':')
        const field = fields.find(f => f.label === fieldLabel)
        if (field) {
          const isComplete =  field.values.map(x => x.label).find(x => {
            return x === valueName
          })

          if (isComplete) {
            setSuggestions(fields.map(x => x.label))
          } else {
            setSuggestions(field.values.map(x => x.label).filter(x => {
              return x.startsWith(valueName)
            }))
          }
        }
      }
    } else {
      setSuggestions(fields.map(x => x.label))
    }
  }

  const selector = (value, suggestion) => {
    let v
    const matches = matcher(value)
      if (matches) {
        // TODO double selecting suggestion there is a bug.
        const lastMatch = matches.pop()
        if (lastMatch.includes(trigger)) {
          const [fieldLabel, valueName] = lastMatch.split(':')
          const field = fields.find(f => f.label === fieldLabel)

          if (field) {
            const isComplete =  field.values.map(x => x.label).find(x => {
              return x === valueName
            })
            if (isComplete) {
              // full match move on to next field
              v = [...matches, lastMatch, suggestion + ":"].join(' ')
            } else {
              // not full match replace suggesion
              v = [...matches, fieldLabel +  ":" + suggestion + " "].join(' ')
            }
          }

        } else {
          v = [matches, suggestion + ":"].join(' ')
        }
      } else {
        v = suggestion + ":"
      }


      setValue(v)
      completer(v)
  }

  const completeMatches = (value) => {
        const matches = matcher(value) || []

        return matches.filter(match => {
          return match.includes(trigger)
        }).filter(match => {
          const [fieldLabel, valueName] = match.split(':')
          const field = fields.find(f => f.label === fieldLabel)

          if (!field) {
            return false
          }

          return field.values.map(x => x.label).find(x => {
            return x === valueName
          })
        }).map((match) => {
            const [fieldLabel, valueLabel] = match.split(':')
            const field = fields.find(f => f.label === fieldLabel)
            const value = field.values.find(v => v.label === valueLabel)

            return {
               field: field.name,
               value: valueLabel,
              operator: 'eq'
            }

          })

      }


  return [completer, selector, completeMatches]
}


export default function TraceFilters({ graphId, onChange }) {
  const {
    setFilters,
    setFilterInterval,
    filterInterval,
    rawFilters: filters,
  } = useContext(FiltersContext)
  const [suggestions, setSuggestions] = useState([])
  const [fields, setFields] = useState([])

  const toString = (filters) => {
    return filters.map(f => {
      return `${f.field}:${f.value}`
    }).join(' ')
  }

  const [value, setValue] = useState(toString(filters))
  const trigger = ':'
  const [completer, select, matcher] = autoComplete({ setSuggestions, setValue, fields, trigger, filters })
  // completer returns two functions one for
  // updating suggestions based on value
  // one for updating the value based on a selected value.
  //
  const keyDown = (e) => {
    if(e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      const matches = matcher(value)
      setFilters(matches)
    }
  }

  useEffect(() => {
    completer(value)
  }, [value])

  useEffect(() => {
    client.query({ query: TRACE_FILTER_OPTIONS,
      variables: {
        graphId
      }
    }).then(({ data }) => {
    const apiFields = Object.entries(data.traceFilterOptions)
    .filter(([k, v]) => {
      if (k === '__typename') {
        return false
      }
      return true
    })
    .map(([k, v]) => {
      return {
        label: k,
        name: k,
        values: v
          ? v
              .filter(v => !!v)
              .map(v => ({
                name: v,
                label: v
              }))
          : []
      }
    })

    const intervalField = {
      name: 'interval', label: 'last', values: [{
        name: 'hour',
        label: 'hour'
      }, {
        name: 'day',
        label: 'day'
      }, {
        name: 'month',
        label: 'month'
      }]
    }

    setFields([intervalField, ...apiFields])
    })
  }, [graphId])

  return (
    <div className={styles.wrapper}>
    <div>
    <textarea onKeyDown={keyDown} onSelect={(evt) => {
      completer(value)
    }} type="text" value={value} onChange={(evt) => {
      setValue(evt.target.value)
      completer(evt.target.value)
    }} /></div>
      <div className={styles.suggestions}>{
      suggestions.map((suggestion) => {
        return (<div className={styles.suggestion} onClick={() => { select(value, suggestion) }} key={suggestion}>{suggestion}</div>)
      })
      }</div>
    </div>
  )
}
