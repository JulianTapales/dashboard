import * as React from 'react'
import {Link} from 'react-router'

interface Props {
}

export default class CongratuationsPopup extends React.Component<Props, {}> {

  render() {
    return (
      <div className='flex justify-center items-center w-100 bg-white-50' style={{pointerEvents: 'all'}}>
        <div className='bg-white br-2 shadow-2 mv-96 db' style={{ minWidth: 600, maxWidth: 900 }}>

          <div className='ma-16 bb bc-grey-2 tc pb-25'>
            <div style={{fontSize: '100px'}}> 🎉</div>
            <h1 className='fw3 ma-38 mb-10 f-38'>Congratulations!</h1>
            <h1 className='fw3 mb-38 mt-10 f-38'>We knew you had in it you.</h1>

            <p className='fw2 f-16 mh-96 db'>Now go out there and build amazing things, you magnificent bastard!</p>
          </div>

          <div className='tc pt-16 pb-25'>
            <div className='flex w-100 tl'>
              <div className='fl w-50 ph-25'>
                <h4 className='fw2 tracked-mega gray-50'>GET STARTED ON YOUR OWN WITH THOSE EXCELLENT GUIDES</h4>
                <div className=''>Org tile</div>
              </div>
              <div className='fl w-50 ph-25'>
                <h4 className='fw2 tracked-mega gray-50'>GET MORE OUT OF GRAPHCOOL WITH OUR TUTORIALS</h4>
                <div className=''>steps</div>
              </div>
            </div>

            <div className='flex justify-center items-center'>
              <div className='pa-16 bg-gray-10 ma-25 tracked-mega white bg-accent'>FINISH ONBOARDING</div>
            </div>
          </div>

        </div>
      </div>
    )
  }
}
