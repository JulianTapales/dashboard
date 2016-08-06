import * as React from 'react'
import Datepicker from '../../../../components/Datepicker/Datepicker'
import { CellProps } from './cells'

const classes: any = require('../Cell.scss')

export default class DateTimeCell extends React.Component<CellProps<Date>, {}> {
  render() {
    return (
      <Datepicker
        className={classes.datepicker}
        defaultValue={this.props.value}
        onChange={(m) => this.props.save(m.toDate())}
        onCancel={() => this.props.cancel()}
        defaultOpen={true}
        applyImmediately={false}
      />)
  }
}