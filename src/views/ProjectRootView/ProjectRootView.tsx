import * as React from 'react'
import {withRouter} from 'react-router'
import * as Relay from 'react-relay'
import * as PureRenderMixin from 'react-addons-pure-render-mixin'
import * as cookiestore from 'cookiestore'
import {bindActionCreators} from 'redux'
import cuid from 'cuid'
import {classnames} from '../../utils/classnames'
import mapProps from '../../components/MapProps/MapProps'
import OnboardingPopup from '../../components/onboarding/OnboardingPopup/OnboardingPopup'
import PlaygroundAPopup from '../../components/onboarding/PlaygroundAPopup/PlaygroundAPopup'
import CongratulationsPopup from '../../components/onboarding/CongratulationsPopup/CongratulationsPopup'
import {showPopup} from '../../actions/popup'
import {connect} from 'react-redux'
import {validateProjectName} from '../../utils/nameValidator'
import ProjectSelection from '../../components/ProjectSelection/ProjectSelection'
import SideNav from '../../views/ProjectRootView/SideNav'
import OnboardSideNav from './OnboardSideNav'
import LoginView from '../../views/LoginView/LoginView'
import AddProjectMutation from '../../mutations/AddProjectMutation'
import {update} from '../../actions/gettingStarted'
import {Viewer, Client, Project} from '../../types/types'
import {Popup, PopupState} from '../../types/popup'
const classes: any = require('./ProjectRootView.scss')

require('../../styles/core.scss')

interface Props {
  router: any
  children: Element
  isLoggedin: boolean
  viewer: Viewer
  user: Client & {gettingStartedState: string}
  project: Project
  allProjects: Project[]
  params: any
  relay: any
  gettingStartedState: any
  popup: PopupState
  checkStatus: boolean
  update: (step: string, userId: string) => void
  showPopup: (popup: Popup) => void,
}

class ProjectRootView extends React.Component<Props, {}> {

  shouldComponentUpdate: any

  private refreshInterval: any

  constructor(props: Props) {
    super(props)

    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)

    this.updateForceFetching()

    cookiestore.set('graphcool_last_used_project_id', props.project.id)
  }

  componentWillMount() {
    if (this.props.isLoggedin) {
      analytics.identify(this.props.user.id, {
        name: this.props.user.name,
        email: this.props.user.email,
        'Getting Started Status': this.props.user.gettingStartedStatus,
        'Product': 'Dashboard',
      })

      Smooch.init({
        appToken: __SMOOCH_TOKEN__,
        givenName: this.props.user.name,
        email: this.props.user.email,
        customText: {
          headerText: 'Can I help you? 🙌',
        },
      })

      if (this.props.gettingStartedState.progress === 0) {
        const id = cuid()
        const element = <OnboardingPopup id={id} firstName={this.props.user.name.split(' ')[0]}/>
        this.props.showPopup({element, id, blurBackground: true})
      }
    } else {
      analytics.identify({
        'Product': 'Dashboard',
      })
    }
    // TODO remove after testing
    const id = cuid()
    // const element = <PlaygroundAPopup />
    //const element = <OnboardingPopup id={id} firstName={this.props.user.name.split(' ')[0]}/>
    const element = <CongratulationsPopup />
    this.props.showPopup({element, id, blurBackground: true})
  }

  componentWillUnmount() {
    clearInterval(this.refreshInterval)
  }

  componentDidUpdate(prevProps) {
    const newStatus = this.props.user.gettingStartedStatus
    const prevStatus = prevProps.user.gettingStartedStatus

    const newCheckStatus = this.props.checkStatus
    const prevCheckStatus = prevProps.checkStatus

    if (newStatus !== prevStatus) {
      this.updateForceFetching()

      if (newStatus === 'STEP11_SKIPPED') {
        analytics.track(`getting-started: skipped at ${prevStatus}`)
      } else {
        analytics.track(`getting-started: finished ${prevStatus}`)
      }
      analytics.identify(this.props.user.id, {
        'Getting Started Status': this.props.user.gettingStartedStatus,
      })
    } else if (newCheckStatus !== prevCheckStatus) {
      this.updateForceFetching()
    }
  }

  render() {
    if (!this.props.isLoggedin) {
      return (
        <LoginView viewer={this.props.viewer}/>
      )
    }

    const blurBackground = this.props.popup.popups.reduce((acc, p) => p.blurBackground || acc, false)
    return (
      <div className={classes.root}>
        <div className={`${blurBackground ? classes.blur : ''} flex w-100`}>
          <div className={classes.sidebar}>
            <div className={classes.projectSelection}>
              <ProjectSelection
                params={this.props.params}
                projects={this.props.allProjects}
                selectedProject={this.props.project}
                add={this.addProject}
              />
            </div>
            <div className={classes.sidenav}>
              <SideNav
                params={this.props.params}
                project={this.props.project}
                viewer={this.props.viewer}
                projectCount={this.props.allProjects.length}
              />
            </div>
          </div>
          <div className={classnames(classes.content, 'flex')}>
            <div
              className='overflow-hidden'
              style={{
                flex: `0 0 calc(100%${this.props.gettingStartedState.isActive() ? ' - 266px' : ''})`,
              }}>
              {this.props.children}
            </div>
            {this.props.gettingStartedState.isActive() &&
            <div className='flex bg-accent' style={{flex: '0 0 266px'}}>
              <OnboardSideNav params={this.props.params}/>
            </div>
            }
          </div>
        </div>
        {this.props.popup.popups.map((popup) =>
          <div className='fixed left-0 right-0 top-0 bottom-0 z-999' style={{pointerEvents: 'auto', overflow: 'scroll' }} key={popup.id}>
            {popup.element}
          </div>
        )}
      </div>
    )
  }

  private updateForceFetching() {
    if (this.props.checkStatus) {
      if (!this.refreshInterval) {
        this.refreshInterval = setInterval(
          () => {
            // ideally we would handle this with a Redux thunk, but somehow Relay does not support raw force fetches...
            this.props.relay.forceFetch({}, () => {
              this.props.update(this.props.user.gettingStartedStatus, this.props.user.id)
            })
          },
          1500
        )
      }
    } else {
      clearInterval(this.refreshInterval)
    }
  }

  private addProject = () => {
    let projectName = window.prompt('Project name:')
    while (projectName != null && !validateProjectName(projectName)) {
      projectName = window.prompt('The inserted project name was invalid.' +
        ' Enter a valid project name, like "Project 2" or "My Project" (First letter capitalized):')
    }
    if (projectName) {
      Relay.Store.commitUpdate(
        new AddProjectMutation({
          projectName,
          userId: this.props.viewer.user.id,
        }),
        {
          onSuccess: () => {
            analytics.track('sidenav: created project', {
              project: projectName,
            })
            this.props.router.replace(`${projectName}`)
          },
        }
      )
    }
  }
}

const mapStateToProps = (state) => {
  return {
    gettingStartedState: state.gettingStarted.gettingStartedState,
    checkStatus: state.gettingStarted.checkStatus,
    popup: state.popup,
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({showPopup, update}, dispatch)
}

const ReduxContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(ProjectRootView))

const MappedProjectRootView = mapProps({
  params: (props) => props.params,
  relay: (props) => props.relay,
  project: (props) => props.viewer.user ? props.viewer.project : null,
  allProjects: (props) => (
    props.viewer.user
      ? props.viewer.user.projects.edges.map((edge) => edge.node)
      : null
  ),
  viewer: (props) => props.viewer,
  user: (props) => props.viewer.user,
  isLoggedin: (props) => props.viewer.user !== null,
})(ReduxContainer)

export default Relay.createContainer(MappedProjectRootView, {
  initialVariables: {
    projectName: null, // injected from router
  },
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
        project: projectByName(projectName: $projectName) {
          id
          name
          ${SideNav.getFragment('project')}
        }
        user {
          id
          email
          name
          gettingStartedStatus
          projects(first: 100) {
            edges {
              node {
                id
                name
              }
            }
          }
        }
        ${LoginView.getFragment('viewer')}
        ${SideNav.getFragment('viewer')}
      }
    `,
  },
})
