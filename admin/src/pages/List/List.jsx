"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { toast } from "react-toastify"
import { Edit, Trash2, Save, X, Search, ChevronDown, ImageIcon, Upload } from "lucide-react"
import "./List.css"

const List = ({ url }) => {
  const [list, setList] = useState([])
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  })
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRowIndex, setSelectedRowIndex] = useState(0)
  const tableRef = useRef(null)
  const selectedRowRef = useRef(null)
  const tableBodyRef = useRef(null)

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`)
      if (response.data.success) {
        setList(response.data.data)
      }
    } catch {
      toast.error("Failed to load data")
    }
  }

  const removeFood = async (id) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id })
      if (response.data.success) {
        toast.success("Item deleted successfully")
        fetchList()

        // Adjust selected row index if needed
        if (selectedRowIndex >= filteredList.length - 1) {
          setSelectedRowIndex(Math.max(0, filteredList.length - 2))
        }
      } else {
        toast.error("Error deleting item")
      }
    } catch {
      toast.error("An error occurred")
    }
  }

  const openEdit = (item) => {
    setEditItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
    })
    setImage(null)
    setImagePreview(`${url}/images/${item.image}`)
  }

  const handleEditChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      const selectedFile = files[0]
      setImage(selectedFile)

      // Create image preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const submitEdit = async (e) => {
    e.preventDefault()
    const data = new FormData()
    data.append("id", editItem._id)
    data.append("name", formData.name)
    data.append("description", formData.description)
    data.append("price", Number(formData.price))
    data.append("category", formData.category)
    if (image) {
      data.append("image", image)
    }

    try {
      const response = await axios.post(`${url}/api/food/edit`, data)
      if (response.data.success) {
        toast.success("Food item updated successfully")
        setEditItem(null)
        setImagePreview(null)
        fetchList()
      } else {
        toast.error("Update failed")
      }
    } catch {
      toast.error("Error updating item")
    }
  }

  const filteredList = list.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (filteredList.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedRowIndex((prev) => (prev < filteredList.length - 1 ? prev + 1 : prev))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedRowIndex((prev) => (prev > 0 ? prev - 1 : 0))
        break
      case "Enter":
        e.preventDefault()
        if (filteredList[selectedRowIndex]) {
          openEdit(filteredList[selectedRowIndex])
        }
        break
      default:
        break
    }
  }

  // Scroll to selected row with perfect scrolling
  useEffect(() => {
    if (selectedRowRef.current && tableBodyRef.current) {
      const container = tableBodyRef.current
      const selectedRow = selectedRowRef.current

      const containerRect = container.getBoundingClientRect()
      const selectedRect = selectedRow.getBoundingClientRect()

      // Check if the selected row is not fully visible
      if (selectedRect.top < containerRect.top || selectedRect.bottom > containerRect.bottom) {
        // Calculate the scroll position to center the selected row
        const scrollTop =
          selectedRow.offsetTop - container.offsetTop - container.clientHeight / 2 + selectedRow.clientHeight / 2

        container.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        })
      }
    }
  }, [selectedRowIndex])

  // Initial data fetch
  useEffect(() => {
    fetchList()
    // Add keyboard event listener
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Update keyboard event listener when filtered list changes
  useEffect(() => {
    window.removeEventListener("keydown", handleKeyDown)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [filteredList, selectedRowIndex])

  return (
    <div className="food-list-container">
      <div className="food-list-header">
        <h2>Food Menu Items</h2>
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-container" ref={tableRef}>
          <table className="food-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>
                  <div className="th-content">
                    Name <ChevronDown size={16} />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    Category <ChevronDown size={16} />
                  </div>
                </th>
                <th>
                  <div className="th-content">
                    Price <ChevronDown size={16} />
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody ref={tableBodyRef}>
              {filteredList.length > 0 ? (
                filteredList.map((item, index) => (
                  <tr
                    key={item._id}
                    className={index === selectedRowIndex ? "selected-row" : ""}
                    ref={index === selectedRowIndex ? selectedRowRef : null}
                    onClick={() => setSelectedRowIndex(index)}
                    onDoubleClick={() => openEdit(item)}
                  >
                    <td>
                      <div className="food-image">
                        <img src={`${url}/images/${item.image}`} alt={item.name} />
                      </div>
                    </td>
                    <td>{item.name}</td>
                    <td>
                      <span className="category-badge">{item.category}</span>
                    </td>
                    <td>${Number.parseFloat(item.price).toFixed(2)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEdit(item)
                          }}
                          aria-label="Edit item"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFood(item._id)
                          }}
                          aria-label="Delete item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-items">
                    No food items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Food Item</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setEditItem(null)
                  setImagePreview(null)
                }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={submitEdit} encType="multipart/form-data">
              <div className="form-columns">
                <div className="form-column">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleEditChange}
                      placeholder="Food name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleEditChange}
                      placeholder="Food description"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="price">Price ($)</label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleEditChange}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <select onChange={handleEditChange} name="category">
                        <option value="Salad">Salad</option>
                        <option value="Rolls">Rolls</option>
                        <option value="Deserts">Deserts</option>
                        <option value="Sandwich">Sandwich</option>
                        <option value="Cake">Cake</option>
                        <option value="Pure Veg">Pure Veg</option>
                        <option value="Pasta">Pasta</option>
                        <option value="Noodles">Noodles</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-column image-column">
                  <div className="image-preview-container">
                    {imagePreview ? (
                      <img src={imagePreview || "/placeholder.svg"} alt="Preview" className="image-preview" />
                    ) : (
                      <div className="no-image">
                        <ImageIcon size={48} />
                        <p>No image selected</p>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="image" className="file-input-label">
                      <div className="file-input-content">
                        <Upload size={20} />
                        <span>{image ? "Change image" : "Upload new image"}</span>
                      </div>
                    </label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleEditChange}
                      className="file-input"
                      accept="image/*"
                    />
                    {!image && editItem.image && <small>Current image: {editItem.image}</small>}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditItem(null)
                    setImagePreview(null)
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default List
