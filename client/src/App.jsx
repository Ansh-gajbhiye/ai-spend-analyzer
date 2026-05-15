import { useState } from 'react'


function App() {
 

  return (
    <>
    <form action="http://localhost:3000/api/upload" method="POST" enctype="multipart/form-data">
    
    <input type="file" name="statement" required/>
        
        <button type="submit">Upload File</button>
    </form>
    </>
  )
}

export default App
