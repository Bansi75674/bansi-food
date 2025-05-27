import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import './UserList.css'


const UserList = ({ url }) => {
    const [users, setUsers] = useState([])
    const [isEditing, setIsEditing] = useState(null)
    const [editFormData, setEditFormData] = useState({})
    const [isLoading, setIsLoading] = useState(true)

    const fetchAllUsers = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get(`${url}/api/user/list`)
            if (response.data.success) {
                setUsers(response.data.data)
            } else {
                toast.error("Failed to fetch users")
            }
        } catch (error) {
            toast.error("Error fetching users")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchAllUsers()
    }, [url])

    const handleEdit = (user) => {
        setIsEditing(user._id)
        setEditFormData({
            name: user.name,
            email: user.email,
        })
    }

    const handleEditChange = (e) => {
        const { name, value } = e.target
        setEditFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSaveEdit = async (id) => {
        try {
            // Replace with your actual update API endpoint
            const response = await axios.put(`${url}/api/user/update/${id}`, editFormData)
            if (response.data.success) {
                toast.success("User updated successfully")
                setIsEditing(null)
                fetchAllUsers()
            } else {
                toast.error("Failed to update user")
            }
        } catch (error) {
            toast.error("Error updating user")
            console.error(error)
        }
    }

    const handleCancelEdit = () => {
        setIsEditing(null)
        setEditFormData({})
    }

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                // Replace with your actual delete API endpoint
                const response = await axios.delete(`${url}/api/user/delete/${id}`)
                if (response.data.success) {
                    toast.success("User deleted successfully")
                    fetchAllUsers()
                } else {
                    toast.error("Failed to delete user")
                }
            } catch (error) {
                toast.error("Error deleting user")
                console.error(error)
            }
        }
    }

    if (isLoading) {
        return <div className="loading-spinner">Loading users...</div>
    }

    return (
        <div className="user-table-container">
            <h2>User Management</h2>

            {users.length === 0 ? (
                <p className="no-users">No users found</p>
            ) : (
                <div className="table-responsive">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="user-id">{user._id.substring(0, 8)}...</td>
                                    <td>
                                        {isEditing === user._id ? (
                                            <input
                                                type="text"
                                                name="name"
                                                value={editFormData.name || ""}
                                                onChange={handleEditChange}
                                                className="edit-input"
                                            />
                                        ) : (
                                            user.name
                                        )}
                                    </td>
                                    <td>
                                        {isEditing === user._id ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={editFormData.email || ""}
                                                onChange={handleEditChange}
                                                className="edit-input"
                                            />
                                        ) : (
                                            user.email
                                        )}
                                    </td>
                                    <td className="action-buttons">
                                        <button className="delete-btn" onClick={() => handleDelete(user._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default UserList
