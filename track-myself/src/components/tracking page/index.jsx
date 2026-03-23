import React, { useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import './styles.scss'

export default function DisplayPage
    () {
    const [myTask, setMyTasks] = useState([])
    const [tasks, setTasks] = useState()
    const [complete, setComplete] = useState(false)

    const handleAdd = () => {
        if (tasks.trim() === '') {
            return
        }
        const newTask = {
            name: tasks,
            complete: false
        }
        setMyTasks(prevArray => [...prevArray, newTask])
        setTasks('')
    }
    const keyBoard = (e) => {
        if (e.key === 'Enter') {
            handleAdd()
        }
    }
    const handleDelete = (deleteI) => {
        setMyTasks(prevArray => {
            return prevArray.filter(
                (tasks, i) => i !== deleteI)
        })
    }
    return (
        <div className="content">
            <div className="content__header">
                <p>This is a Task Tracker</p>

            </div>
            <div className="content__main-page">
                <div className="content__main-page__input">   <input id="taskInput" value={tasks}
                    type="text"
                    onChange={(e) => setTasks(e.target.value)} placeholder='How do you want to plan your day'
                    onKeyDown={keyBoard} />
                    <button onClick={handleAdd}>add task</button>

                </div>
                <div className="content__main-page__displayTasks">


                    <ul>
                        {
                            myTask.map((item, i) => (
                                <li><span>{item.name}</span>
                                    <span><button onClick={() => handleDelete(i)}>{<DeleteIcon />}</button>
                                        <input type="checkbox" id="complete" /></span></li>
                            ))
                        }</ul>
                </div>

            </div>
        </div>
    )
}
