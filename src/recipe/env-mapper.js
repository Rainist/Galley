
import * as _ from 'lodash'
import React, { Component } from 'react';
const Fragment = React.Fragment
import { Form, Split, Tile, Tiles, Heading, Title, Box, Card, FormField, TextInput, Header } from 'grommet'
import styled from 'styled-components';
import YamlViewer from '../comp/yaml-viewer'
import EnvForm from '../comp/env-form'

import { onChangeInput, initialModel, resultStream } from './env-mapper/data-handler'

const SectionHeaderStyle = styled.div`
  padding: 0.5em 3em 0 3em;
`;

const { placeholder } = initialModel
const emptyObject = { name: '', env: ''}
const emptyInput = { namespace: '', cm: { ...emptyObject }, secret: { ...emptyObject }  }

export default class EnvMapper extends Component {
  state = { input: emptyInput, output: {} }

  componentDidMount() {
    resultStream.subscribe(result => {
      const { cm, secret, env: snippet } = result
      const output = {cm, secret, snippet}
      this.setState({ output })
    });

    this.calculate()
  }

  calculate = () => {
    const { input: oldInput } = this.state

    const input = _.cloneDeep(oldInput)
    const self = this

    const selectObj = (a, b) => {
      if (_.isObject(a)){
        return _.mergeWith(a, b, selectObj)
      }
      return a || b
    }

    const filledInput = _.mergeWith(input, placeholder, selectObj)

    onChangeInput(filledInput)
  }

  onChangeNS = ({ target: { value: namespace }}) => {
    const input = { ...this.state.input, namespace }
    this.setState({ input }, () => this.calculate())
  }

  onChangeCm = (cm) => {
    const input = { ...this.state.input, cm }
    this.setState({ input }, () => this.calculate())
  }

  onChangeSecret = (secret) => {
    const input = { ...this.state.input, secret }
    this.setState({ input }, () => this.calculate())
  }

  render() {
    const { input, output } = this.state
    const ph = placeholder

    return (
      <Fragment>
        <SectionHeaderStyle>
          <Header align='start'>
            <Box flex='grow'>
              <Heading align='start'>Env mapping</Heading>
            </Box>
            <Form>
              <FormField label='namespace'>
                <TextInput placeHolder={ph.namespace} onDOMChange={this.onChangeNS} value={input.namespace} />
              </FormField>
            </Form>
          </Header>
        </SectionHeaderStyle>
        <Tiles fill={true}>
          <Tile>
            <EnvForm type='configmap' placeholder={ph.cm} onChange={this.onChangeCm} value={input.cm} />
          </Tile>
          <Tile>
            <EnvForm type='secret' placeholder={ph.secret} onChange={this.onChangeSecret} value={input.secret} />
          </Tile>
        </Tiles>
        <Tiles fill={true}>
          <Tile>
            <YamlViewer title='configmap' codeText={output.cm || ''} />
          </Tile>
          <Tile>
            <YamlViewer title='secret' codeText={output.secret || ''} />
          </Tile>
          <Tile>
            <YamlViewer title='env snippet' codeText={output.snippet || ''} />
          </Tile>
        </Tiles>
      </Fragment>
    )
  }
}
