// import { Navigate, useLocation } from 'react-router-dom'
// import { useAuth } from '../../contexts/auth/AuthContext'

// export default function RequireAuth({ children }) {
//     const location = useLocation()
//     const { userInfo } = useAuth()
//     console.log(userInfo)

//     if (!userInfo) {
//         return <Navigate to='/auth/signin' replace state={{ from: location }} />
//     }

//     return children
// }
