import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function Category() {
  const [category, setCategory] = useState([])
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    axios.get(`${apiUrl}/auth/category`)
      .then(result => {
        setCategory(result.data.categories)
      }).catch(err => console.log(err))
  }, [])

  return (
    <div className='px-5 mt-3'>
      <div className='d-flex justify-content-center'>
        <h3>Cetegory List</h3>
      </div>
      <Link to="/dashboard/add_category" className='btn btn-success'>Add Cetegory</Link>
      <div className='mt-3'>
        <table className='table'>
          <thead>
            <tr>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {category.map(category => (
              <tr key={category.id}>
                <td>{category.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
export default Category
