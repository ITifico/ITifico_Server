import React from "react";
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { useGetPractiseQuery } from "../../services/practiseApi";
import PractiseAccordion from "./components/PractiseAccordion/PractiseAccordion";
import PractiseQuestion from "./components/PractiseQuestion/PractiseQuestion";

import './PractiseDetail.scss'

const PractiseDetail = () => {
  const { practiseId } = useParams();
  const { data: practise, isLoading } = useGetPractiseQuery(practiseId);
  const { lng } = useSelector((state) => state.lngDetect);

  return (
    <div className="course__practise">
      <PractiseAccordion title={"Practice"} className="practise__container">
        {isLoading ? (
          "Loading..."
        ) : practise?.data ? (
          practise?.data?.[lng].fields.map((field, index) => (
            <React.Fragment key={index + "practise-fields"}>
              <PractiseQuestion question={field.question} index={index} />
              <PractiseAccordion answer={field.answer} />
            </React.Fragment>
          ))
        ) : (
          <p>Practise items not found</p>
        )}
        <div className="container__bottom">
          <Link to="#less" className="bottom__link">
            Collapse
          </Link>
        </div>
      </PractiseAccordion>
    </div>
  );
};

export default PractiseDetail;
