import {useEffect,useState} from "react";
import api from "../../api/axios.js";
import Topbar from "../../components/layout/Topbar.jsx";
import DataTable from "../../components/ui/DataTable.jsx";
import Badge from "../../components/ui/Badge.jsx";
import StatCard from "../../components/ui/StatCard.jsx";

export default function Priorities(){
    const [items,setItems]=useState([]);
    const[loading,setLoading]=useState(true);

    useEffect(()=>{
        api.get("/priorities")
        .then((res)=>setItems(res.data))
        .finally(()=>setLoading(false));
    },[]);

    const columns=[
        {
            key:"title",
            header:"Item"
        },
        {
            key:"source_type",
            header:"Type"
        },
        {
            key:"score",
            header:"Score"
        },
        {
            key:"level",
            header:"Priority",
            render:(row)=>(
                <Badge variant={row.level?.toLowerCase()}>{row.level}</Badge>
            )
        }
    ];
    const highCount=items.filter(i =>i.level==="High").length;
    const mediumCount=items.filter(i=> i.level==="Medium").length;
    const lowCount=items.filter(i=>i.level==="Low").length;
    return(
        <>
        <Topbar title=" AI Priority Recommendations" subtitle={`${items.length} prioritized items`} user={{initials:"AM"}}/>
         <div className="p-4 sm:p-6 lg:p-8 space-y-6"> 
            <div className="grid gap-4 md:grid-cols-3">
               <StatCard label="High Priority"   value={highCount}   tint="rose"/>
               <StatCard label="Medium Priority" value={mediumCount} tint="amber"/>
               <StatCard label="Low Priority"    value={lowCount}    tint="emerald"/> 

            </div>
            {loading ? ( <p>Loading...</p>):(<DataTable 
              columns={columns}
              data={items}
              searchable searchPlaceholder="Search recommendations..."/>
               
           )}
                    
                
        </div>
        
        </>
    )
}