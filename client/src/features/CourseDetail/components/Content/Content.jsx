import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  ImageBlock,
  MenuBlock,
  QuoteBlock,
  TextBlock,
} from "../../../../components";
import { useGetLessonQuery } from "../../../../services/lessonApi";
import Sidebar from "../Sidebar/Sidebar";

import "./Content.scss";

const Content = () => {
  const { lessonId } = useParams();
  const { data: lesson, isLoading: lessonLoading } =
    useGetLessonQuery(lessonId);
  const { lng } = useSelector((state) => state.lngDetect);
  const [number, setNumber] = useState({ index: 1, idx: 1 });

  console.log(lesson);

  if (lessonLoading) return "Loading...";

  return (
    <div className="container">
      <div className="course__sidebarbg" />
      <div className="course__content">
        <div className="header__banner">
          <h1 className="banner__text">Курс по C#</h1>
        </div>
        <div className="content__sidebar">
          <Sidebar setNumber={setNumber} />
        </div>
        <div className="content__main">
          <header className="content__header">
            <div className="header__title">
              <h3 className="title--small">{lesson?.data?.[lng]?.theme}</h3>
              <h1 className="title--main">{lesson?.data?.[lng]?.title}</h1>
            </div>
            <div className="header__rating">
              {number.index}.{number.idx}
            </div>
          </header>
          <div className="main__body">
            {lesson?.data?.[lng].fields.map((field, index) => {
              if (field.element === "text") {
                return <TextBlock data={field} key={index + "field"} />;
              } else if (field.element === "menu") {
                return <MenuBlock data={field} key={index + "field"} />;
              } else if (field.element === "images") {
                return (
                  <ImageBlock
                    data={field}
                    index={index}
                    component="lesson"
                    key={index + "field"}
                  />
                );
              } else if (field.element === "quote") {
                return <QuoteBlock data={field} key={index + "field"} />;
              } else {
                return <p>Loading</p>;
              }
            })}
          </div>
          <div className="slide__lesson">
            <div className="slide__box">
              <button className="prev__button">
                {/* <LeftArrowIcon /> */}
              </button>
              <p className="box__text">{}</p>
            </div>
            <div className="slide__box">
              <p className="box__text">{}</p>
              <button className="next__button">
                {/* <RightArrowIcon /> */}
              </button>
            </div>
          </div>
          <div className="content__practise">{/* <Practise /> */}</div>
        </div>
      </div>
    </div>
  );
};

export default Content;
