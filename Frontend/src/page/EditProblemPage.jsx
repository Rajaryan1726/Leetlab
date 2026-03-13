import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CreateProblemForm from "../components/CreateProblemForm";
import { axiosInstance } from "../lib/axios";

const EditProblemPage = () => {
  const { id } = useParams();
  const [problemData, setProblemData] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axiosInstance.get(
          `/problems/getproblembyid/${id}`
        );

        console.log("FULL DATA:", res.data.data); // debug
        setProblemData(res.data.data);

      } catch (err) {
        console.log("Error fetching problem:", err);
      }
    };

    fetchProblem();
  }, [id]);

  if (!problemData) return <div>Loading...</div>;

  return <CreateProblemForm editData={problemData} />;
};

export default EditProblemPage;
