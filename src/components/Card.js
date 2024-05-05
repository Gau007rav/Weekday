import React, { useState, useEffect } from 'react';
import "./card.css"


function Card() {
    //these state is used managed data
    const [jdList, setJobData] = useState([]);
    const [expanded, setExpanded] = useState(false);
    // these state is used to apply filters
    const [minExperience, setMinExperience] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [remote, setLocation] = useState(true);
    const [locationName, setLocationName] = useState("")
    // these state is used to make infinite scroll
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);


    useEffect(() => {
        fetchJobData();

    }, [page]); // Fetch data when the page change



    // filters apply in our application
    let applyFIlter = () => {
        let filterJobdata = jdList
        if (minExperience !== " ") {
            filterJobdata = filterJobdata.filter((job) => job.minExp >= minExperience)
        }
        if (companyName !== " ") {
            filterJobdata = filterJobdata.filter(job => job.companyName.toLowerCase().includes(companyName.toLowerCase()))
        }
        if (remote) {
            filterJobdata = filterJobdata.filter(job => job.location.toLowerCase().includes("remote"))
        }
        if (locationName !== " ") {
            filterJobdata = filterJobdata.filter(job => job.location.toLowerCase().includes(locationName.toLowerCase()))
        }
        setJobData(filterJobdata)

    }
    useEffect(() => {
        applyFIlter()
    }, [minExperience, companyName, remote, locationName])


    const fetchJobData = async () => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const body = JSON.stringify({
            "limit": 10,
            "offset": 0
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body
        };
        if (!hasMore || loading) return; // Prevent multiple simultaneous requests
        setLoading(true);
        try {
            await fetch("https://api.weekday.technology/adhoc/getSampleJdJSON", requestOptions)
                .then((response) => response.json())
                .then((result) => setJobData(prevData => [...prevData, ...result.jdList]));
            setPage(prevPage => prevPage + 1);
            setHasMore(jdList.length > 0)

        } catch (error) {
            console.error('Error fetching job data:', error);
        }
    };

    // for managing scrolling
    const handleScroll = () => {
        if (window.innerHeight + document.documentElement.scrollTop === document.documentElement.offsetHeight) {
            fetchJobData();
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []); // Attach event listener only once when component mounts

    const toggleDescription = () => {
        setExpanded(!expanded);
    };

    return (
        <>
            <div className='filter'>
                <label>Experience</label>
                <input type='text' placeholder='experience' onChange={(e) => setMinExperience(e.target.value)} ></input>
                <label>Company Name</label>
                <input type='text' placeholder='company Name' onChange={(e) => setCompanyName(e.target.value)}></input>
                <label>Location Name</label>
                <input type='text' placeholder='location Name' onChange={(e) => setLocationName(e.target.value)}></input>
                <label>Remote Job</label>
                <input type="checkbox" placeholder='experience' checked={remote} onChange={(e) => setLocation(e.target.checked)}></input>

            </div>
            <div className="card">
                {jdList.map((element, id) => {
                    return (
                        <>
                            <div key={element.jdUid}>
                                <img src={element.logoUrl} alt='img'></img>
                                <p><span style={{fontWeight:"bold"}}>Company:</span> {element.companyName}</p>
                                <p><span style={{fontWeight:"bold"}}>Job-Title:</span> {element.jobRole}</p>
                                <p><span style={{fontWeight:"bold"}}>Location:</span> {element.location}</p>
                                <p><span style={{fontWeight:"bold"}}>Experience Required:</span> {element.minExp} - {element.maxExp} years</p>
                                <h3>About Company</h3>
                                <h4>about us</h4>
                                <p className='description'> {expanded ? element.jobDetailsFromCompany : element.jobDetailsFromCompany.slice(0, 100) + "..."}</p>
                                <span className="expand" onClick={toggleDescription}>
                                    {expanded ? 'Show less' : 'Show more'}
                                </span>
                                <br></br>

                                <button className="apply-button">Apply</button>
                            </div>

                        </>

                    )
                }

                )}
                {loading && <p>Loading...</p>}
                {!hasMore && <p>No more jobs to load</p>}
            </div>
        </>
    );
}

export default Card;
