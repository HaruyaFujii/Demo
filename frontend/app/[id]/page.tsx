import React from 'react'
import { connect } from 'react-redux'

export const page = (props) => {
  return (
    <div>page</div>
  )
}

const mapStateToProps = (state) => ({})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(page)