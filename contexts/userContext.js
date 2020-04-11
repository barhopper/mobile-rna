import React, {useState, useContext} from 'react'

const UserContext = React.createContext()
const UpdateUserContext = React.createContext()

export const UserProvider = ({children}) => {
  const [state, dispatch] = useState(null)

  return (
    <UserContext.Provider value={state}>
      <UpdateUserContext.Provider value={dispatch}>
        {children}
      </UpdateUserContext.Provider>
    </UserContext.Provider>
  )
}

export const useUser = () => useContext(UserContext)

export const useUpdateUser = () => useContext(UpdateUserContext)
