import { useEffect, useState } from 'react'
import WorkspaceTopBar from '../../../../components/Workspace/WorkspaceTopBar'
import './doctorDetail.css'
import { useParams } from 'react-router-dom'
import { apiUtils } from '../../../../utils/newRequest'

export default function DoctorDetail() {
    const doctorId = useParams().doctorId
    const [doctorDetail, setDoctorDetail] = useState(null)

    useEffect(() => {
        const fetchDoctorDetail = async () => {
            // Fetch doctor detail by ID
            const response = await apiUtils.get(`/user/readDoctorDetail/${doctorId}`)
            if (response) {
                setDoctorDetail(response.data.metadata.user)
            }
        }
        fetchDoctorDetail()
    }, [])

    return (
        <div className='dd-page'>
            <WorkspaceTopBar />

            <div className='dd-inner'>
                <section className='dd-header'>
                    <div className='dd-avatar' />

                    <div className='dd-info'>
                        <div className='dd-info__row'>
                            <h2>Dr. {doctorDetail?.fullName}</h2>
                            <span className='dd-info__sex'>F/M</span>
                            <button className='dd-icon-btn' aria-label='Edit profile'>
                                <svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#e3e3e3'>
                                    <path d='M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z' />
                                </svg>
                            </button>
                        </div>

                        <div className='dd-info__grid'>
                            <div className='dd-field'>
                                <span className='dd-label'>Email:</span>
                                <a href='mailto:abc@gmail.com'>{doctorDetail?.email}</a>
                            </div>
                            <div className='dd-field'>
                                <span className='dd-label'>Phone:</span>
                                <span>{doctorDetail?.phone}</span>
                            </div>
                            <div className='dd-field'>
                                <span className='dd-label'>Birthday:</span>
                                <span>DD/MM/YYYY</span>
                            </div>
                            <div className='dd-field'>
                                <span className='dd-label'>Age:</span>
                                <span>Age</span>
                            </div>
                            <div className='dd-field'>
                                <span className='dd-label'>Address:</span>
                                <span>{doctorDetail?.address}</span>
                            </div>
                            <div className='dd-field'>
                                <span className='dd-label'>Experience:</span>
                                <span>10 years</span>
                            </div>
                            <div className='dd-field'>
                                <span className='dd-label'>Language:</span>
                                <span>English, Spanish</span>
                            </div>
                        </div>

                        <div className='dd-speciality'>
                            <span className='dd-label'>Speciality:</span>
                            <div className='dd-speciality__chips'>
                                <div className='dd-chip' />
                                <div className='dd-chip' />
                                <div className='dd-chip' />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
