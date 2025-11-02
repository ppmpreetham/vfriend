import { useEffect, useState } from "react"
import { personData } from "../../store/newtimeTableStore"
import { getUserTimetable } from "../../store/newtimeTableStore"
import { CompactSlot } from "../../types/timeTable"

interface PersonTimeProp {
  subject: string
  building: string
  place: string
  type: boolean
}

interface Place {
  building: string
  place: string
}
function computeDistance(place1: Place, place2: Place) {
  return place1.building.length + place2.building.length
}

const PersonPage = () => {
  const today = new Date().getDay()
  const [data, setData] = useState<CompactSlot[]>()

  const testData: PersonTimeProp[] = [
    { subject: "dsa", building: "ab1", place: "501", type: true },
    { subject: "dsa", building: "ab3", place: "501", type: true },
    { subject: "dsa", building: "ab3", place: "502", type: true },
    { subject: "dsa", building: "ab3", place: "512", type: true },
    { subject: "dsa", building: "ab2", place: "312", type: true },
    { subject: "dsa", building: "ab3", place: "311", type: true },
    { subject: "dsa", building: "ab3", place: "301", type: true },
    { subject: "dsa", building: "ab3", place: "501", type: true },
    { subject: "dsa", building: "ab1", place: "501", type: true },
    { subject: "dsa", building: "ab3", place: "501", type: true },
    { subject: "dsa", building: "ab3", place: "502", type: true },
    { subject: "dsa", building: "ab3", place: "512", type: true },
  ]

  useEffect(() => {
    async function loadTimetable() {
      try {
        const timetableData = await getUserTimetable()
        setData(timetableData?.filter((data) => data.d === today))
      } catch (err) {
        console.error("Error fetching timetable:", err)
      }
    }
    loadTimetable()
  }, [])
  return (
    <div className="w-full h-fit px-4">
      <div className="flex flex-row w-full">
        <div className="flex flex-col w-full">
          <div className="text-4xl">Your Friend</div>
          {testData.map((person) => (
            <div className="flex flex-row gap-4 uppercase">
              <div className="size-6 bg-primary rounded-full self-center"></div>
              <div className="flex flex-col min-w-1/2 my-2">
                <div className="text-2xl">{person.subject}</div>
                <div className="text-xl">
                  {person.building}-{person.place}
                </div>
              </div>
              <div className="w-[1px] bg-white"></div>
              {/* <div className="">{computeDistance({ building: person.building, place: person.place }, {building: data.})}</div> */}
            </div>
          ))}
        </div>
        <div className="flex flex-col w-1/2 gap-4"></div>
      </div>
    </div>
  )
}

export default PersonPage
