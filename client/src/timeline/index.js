import React, { useState } from 'react'
import Rpm from './rpm'
import LatencyDistribution from './latencyDistribution'

export function TimeLine({ graphId, operationId }) {
  return (
    <div>
      <Rpm graphId={graphId} />
      <LatencyDistribution graphId={graphId} />
    </div>
  )
}
