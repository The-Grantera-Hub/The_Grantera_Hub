import { createContext, useContext, useState } from 'react'
import FeedbackAlert from '@/components/Alert'

const SpinnerContext = createContext()

const SpinnerProvider = ({ children }) => {
  const [appContext, setAppContext] = useState({
    spinner: false,
  })
  const [alertMsg, setAlertMsg] = useState({
    open: false,
    status: false,
    msg: null,
    statusMsg: null,
  })
  return (
    <SpinnerContext.Provider
      value={{ appContext, setAppContext, alertMsg, setAlertMsg }}
    >
      {children}
      {appContext.spinner && (
        <div className="spin w-screen h-screen overflow-hidden bg-black/40 backdrop-blur-md fixed top-0 left-0 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-5">
            <img
              src="/Grantera.svg"
              alt="grantera logo"
              className="w-32 h-32 rounded-full border-2 border-gray-400 animate-pulse"
            />
            <span className="text-white text-center">Please wait...</span>
          </div>
        </div>
      )}
      {alertMsg.open && (
        <FeedbackAlert
          isOpen={alertMsg.open}
          isClose={() =>
            setAlertMsg((prev) => ({ ...prev, open: !alertMsg.open }))
          }
          message={{
            status: alertMsg.status,
            statusMsg: alertMsg.statusMsg,
            message: alertMsg.msg,
          }}
        />
      )}
    </SpinnerContext.Provider>
  )
}

export default SpinnerProvider
export const useSpinner = () => useContext(SpinnerContext)
