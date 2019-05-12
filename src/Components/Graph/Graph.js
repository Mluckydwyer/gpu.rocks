import React from 'react'
import Plot from 'react-plotly.js'

const Graph = ({info, interpolation = false}) => {
  const plotData = []

  const interpolateArrays = (arrayX, arraysY) => {
    const newArrayX = arrayX.map(val => val),
      newArraysY = arraysY.map(arr => arr.map(val => val)); // Clone input arrays to set the output

    let newI = 0;
    arrayX.forEach((x, i) => { // loop over the input x array
      const lowX = x,
        highX = newArrayX[newI + 1],
        diffX = highX - lowX,
        lowY = arraysY.map(arr => arr[i]),
        highY = arraysY.map(arr => arr[i + 1]),
        diffY = lowY.map((low, i) => highY[i] - low);
      if (diffX > 128){ // interpolate only if there is a gap of more than 128 values
        for (let scaleDiff = 16; scaleDiff > 0; scaleDiff -= 1){ // decreasing loop to add 16 new values
          newArrayX.splice(newI + 17 - scaleDiff, 0, lowX + Math.pow((1 / scaleDiff), 3) * diffX) // cube the reciprocal of scaleDiff and multiply it to the difference and add to the lower value
          newArraysY.forEach((arr, iY) => arr.splice(newI + 17 - scaleDiff, 0, lowY[iY] + (Math.pow((1 / scaleDiff), 3) * diffY[iY]))) // cube the reciprocal of scaleDiff and multiply it to the difference and add to the lower value
        }
        newI += 16; // add offset for 16 new values
      }
      newI += 1;
    })

    return {
      arraysY: newArraysY,
      arrayX: newArrayX
    }
  }

  const pushPlotData = each => {
    const displayName = each.displayName,
      x_series = each.data.x_series,
      y_series_upper = each.data.y_series_upper,
      y_series = each.data.y_series,
      y_series_lower = each.data.y_series_lower,
      {arrayX, arraysY} = interpolation ? interpolateArrays(x_series, [y_series_lower, y_series, y_series_upper]) : {arrayX: x_series, arraysY: [y_series_lower, y_series, y_series_upper]},
      lineColor = each.lineColor,
      shadowColor = each.shadowColor;

    plotData.push({
      name: `${displayName} (Upper Bound)`,
      x: arrayX,
      y: arraysY[2],
      type: 'scatter',
      mode: 'lines',
      marker: {color:'#444'},
      line: {
        width:0,
        shape: 'spline'
      }
    })
    plotData.push({
      name: `${displayName} (Mean)`,
      x: arrayX,
      y: arraysY[1],
      type: 'scatter',
      mode: 'lines',
      line: {
        color: lineColor,
        shape: 'spline'
      },
      fillcolor: shadowColor,
      fill: 'tonexty'
    })
    plotData.push({
      name: `${displayName} (Lower Bound)`,
      x: arrayX,
      y: arraysY[0],
      type: 'scatter',
      mode: 'lines',
      marker: {color:'#444'},
      line: {
        width:0,
        shape: 'spline'
      },
      fillcolor: shadowColor
    })
  }

  info.forEach(pushPlotData)

  return (
    <Plot 
      data={plotData}
      layout={{
        yxais: {
          type: 'log',
          autorange: true
        },
        showlegend: false,
        hovermode: 'closest'
      }}
    />
  )
}

export default Graph