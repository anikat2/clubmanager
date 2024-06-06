import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";

function App() {
  const [data, setData] = useState([]);
  const [uniqueIDs, setUniqueIDs] = useState([]);
  const [countPerDay, setCountPerDay] = useState([]);
  const [student, setStudent] = useState({
    ID: "",
    Name: ""
  });

  const uniqueIDsRef = useRef(null);
  const newStudentRef = useRef(null);
  const meetingRef = useRef(null);
  const retentionRef = useRef(null);
  const countPerDayGraphRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const renderLineGraph = (data) => {
    if (countPerDayGraphRef.current) {
      if (chartInstanceRef.current) {
        // Destroy existing chart instance
        chartInstanceRef.current.destroy();
      }
      
      const ctx = countPerDayGraphRef.current.getContext("2d");
      chartInstanceRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.map(item => item.date),
          datasets: [{
            label: "Count of People Attending Each Day",
            data: data.map(item => item.count),
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1
          }]
        }
      });
    }
  };

  useEffect(() => {
    fetch('http://localhost:8081/users')
      .then(res => res.json())
      .then(data => {
        setData(data);
        const ids = data.map(d => d.ID);
        setUniqueIDs([...new Set(ids)]);
        console.log("Fetched data:", data);
        console.log("Unique IDs:", ids);
      })
      .catch(err => console.error('Error fetching data:', err));

    fetch('http://localhost:8081/count-per-day')
      .then(res => res.json())
      .then(data => {
        setCountPerDay(data);
        console.log("Count per day:", data);
        renderLineGraph(data);
      })
      .catch(err => console.error('Error fetching count per day:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudent(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const email = `${student.ID}@sbstudents.org`;
    
    // Create a new student object with the generated email
    const newStudent = { ...student, Phone: new Date().toISOString().split('T')[0], Email: email };
  
    fetch('http://localhost:8081/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newStudent)
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then(err => { throw new Error(err.error); });
        }
      })
      .then(data => {
        console.log("Added student:", data);
        setData(prev => [...prev, data]);
        setUniqueIDs(prev => [...prev, newStudent.ID]);
        fetch('http://localhost:8081/count-per-day')
          .then(res => res.json())
          .then(data => {
            setCountPerDay(data);
            console.log("Updated count per day:", data);
            renderLineGraph(data);
          })
          .catch(err => console.error('Error fetching count per day:', err));
      })
      .catch(err => alert('Error: ' + err.message));
  };
    const scrollToNewStudent= () => {
    newStudentRef.current.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToUniqueIDs = () => {
    uniqueIDsRef.current.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToMeetingData= () => {
    meetingRef.current.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToRetention= () => {
    retentionRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleIDClick = (id) => {
    fetch(`http://localhost:8081/users/${id}`)
      .then(res => res.json())
      .then(instances => {
        console.log("Instances of ID:", id, instances);
        alert(`Instances of ID ${id}: ${JSON.stringify(instances, null, 2)}`);
      })
      .catch(err => console.error('Error fetching instances:', err));
  };

  return (
    <div style={{ padding: "50px" }}>
      <div id="navBar">
        <button onClick={scrollToNewStudent}>New Student</button>
        <button onClick={scrollToUniqueIDs}>Student Summary</button>
        <button onClick={scrollToMeetingData}>Meeting Data</button>
        <button onClick={scrollToRetention}>Retention Data</button>
      </div>
      <div id="titleBlock">
        <div id="title">
          <h1 id="titletext">ClubManager</h1>
        </div>
        <p id="desc">The one stop shop for all your high school club attendance needs!</p>
      </div>
      <br></br>
      <br></br>
      <div className="form">
        <h2 style={{ textAlign: "center" }} ref={newStudentRef}>Scan a new student!</h2>
        <input type="text" placeholder="ID" onChange={handleChange} name="ID" value={student.ID}></input>
        <input type="text" placeholder="Name" onChange={handleChange} name="Name" value={student.Name}></input>
        <button onClick={handleSubmit} style={{ backgroundColor: "#7D4F50", height: "2vw", fontSize: "1.2vw" }}>Submit</button>
      </div>
      <h2 ref={uniqueIDsRef} style={{ textAlign: "center" }}>Student IDs</h2>
      <div id="idsWrap">
        <ul>
          {uniqueIDs.map((id, index) => (
            <li key={index} onClick={() => handleIDClick(id)} style={{ cursor: "pointer", color: "blue" }}>
              {id}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ textAlign: "center" }}>
        <h3 ref = {retentionRef}>Count Per Day</h3>
        <canvas ref={countPerDayGraphRef}></canvas>
      </div>
      <div id="countsWrap">
        <ul>
          {countPerDay.map((item, index) => (
            <li key={index}>{item.date}: {item.count}</li>
          ))}
        </ul>
      </div>
      <div id="tableWrap">
        <table ref = {meetingRef} style={{ textAlign: "center" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              return (
                <tr key={i}>
                  <td id = "idis">{d.ID}</td>
                  <td id = "nameis">{d.Name}</td>
                  <td id = "phoneis">{d.Phone}</td>
                  <td id = "emailis">{d.Email}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
