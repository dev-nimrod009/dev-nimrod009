import {   useNavigate } from 'react-router-dom'
 
export default function NavBar() {
    const list = [
        {
            name:' Home',
            path: '/home'
        },
        {
            name: 'About',
            path: '/about'
        }, {
            name: 'Skills',
            path: '/skills'
        }, {
            name: 'contact me',
            path:"/contactme"
        }, {
            name: 'resume',
            path: '/resume',
        },
    ]
    
    const navigate = useNavigate()
    const handleNavigate = (path) => {
        navigate(path)
    }
    return (
        <div className="nav-bar">

            <ul>{
                list.map((items, i) => (
                    <li key={i}>  <button onClick={()=>handleNavigate(items.path)}>{items.name}</button></li>
                ))
            }</ul>

        </div>
 
    )
}
