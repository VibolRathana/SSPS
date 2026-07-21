import { useEffect, useState } from "react";
import api from "../../api/axios";
import Topbar  from "../../components/layout/Topbar";
import Button from "../../components/ui/Button";

const DAYS = ["Monday" , "Tuesday" , "Wednesday","Thursday" , "Friday","Saturday","Sunday"];
export default function StudyAvailability(){
    const [availability , setAvailability]= useState(DAYS.map((day)=>({day_of_week: day , available_hours:0})));
    const [loading, setLoading]= useState(true);
    const [saving,  setSaving]= useState(false);

    useEffect(()=>{
        
        loadAvailability();
    },[]);

    async function loadAvailability(){
        try{
            const res= await api.get("/study-availability");

            if(res.data.length >0){
                setAvailability(res.data);
            }
        }catch(err){
            console.error(err);
        }finally{
            setLoading(false);
        }
    }
    function updateHour(index , value){
        const data= [...availability];
        data[index].available_hours = Number(value);
        setAvailability(data);
    }
    async function saveAvailability(){
        setSaving(true);
        try{
            for (const item of availability){

                if(item.availability_id){
                  await api.put(`/study-availability/${item.availability_id}`,item);
                }else{
                  await api.post("/study-availability",item);
                }
            }
            alert("Study availability saved successfully.")
            loadAvailability();
        }catch(err){
            console.error(err);
            alert(err.response?.data?.message ||"Failed to save.");
        }finally{
            setSaving(false);
        }
    }
     return (
    <>
      <Topbar
        title="Study Availability"
        subtitle="Set how many hours you can study each day."
        user={{ initials: "AM" }}
      />

      <div className="p-6">
        <div className="max-w-xl rounded-2xl bg-white shadow p-6 space-y-5">

          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              {availability.map((item, index) => (
                <div
                  key={item.day_of_week}
                  className="flex items-center justify-between"
                >
                  <label className="font-medium w-32">
                    {item.day_of_week}
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={item.available_hours}
                    onChange={(e) =>
                      updateHour(index, e.target.value)
                    }
                    className="w-24 rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              ))}

              <div className="pt-4">
                <Button
                  onClick={saveAvailability}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Availability"}
                </Button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}