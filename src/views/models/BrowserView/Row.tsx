import * as React from 'react'
import * as Relay from 'react-relay'
import Cell from './Cell'
import { UpdateCallback } from './Cell'
import { Model, Field } from '../../../types/types'
import CheckboxCell from './CheckboxCell'
import { compareFields } from '../utils'
import { isScalar } from '../../../utils/graphql'
const classes: any = require('./Row.scss')

interface Props {
  model: Model
  projectId: string
  item: any
  columnWidths: {[key: string]: number}
  update: (value: any, field: Field, callback: UpdateCallback) => void
  isSelected: boolean
  onSelect: (checked: boolean) => void
}

class Row extends React.Component<Props, {}> {

  render () {
    const fields = this.props.model.fields.edges
      .map((edge) => edge.node)
      .filter((field) => isScalar(field.typeIdentifier) || !field.isList)
      .sort(compareFields)

    return (
      <div className={`${classes.root} ${this.props.isSelected ? classes.isSelected : ''}`}>
        <CheckboxCell
          onChange={this.props.onSelect}
          checked={this.props.isSelected}
        />
        {fields.map((field) => (
          <Cell
            key={field.id}
            field={field}
            value={this.props.item[field.name]}
            width={this.props.columnWidths[field.name]}
            update={this.props.update}
            projectId={this.props.projectId}
          />
        ))}
        <div style={{width: 250}}></div>
      </div>
    )
  }
}

export default Relay.createContainer(Row, {
  fragments: {
    model: () => Relay.QL`
      fragment on Model {
        fields(first: 1000) {
          edges {
            node {
              id
              name
              ${Cell.getFragment('field')}
            }
          }
        }
      }
    `,
  },
})