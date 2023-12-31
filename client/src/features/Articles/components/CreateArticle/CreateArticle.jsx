import React, { useEffect, useState } from "react";
import _ from "lodash";
import moment from "moment";

import {
  useCreateArticleMutation,
  useEditArticleMutation,
  useGetArticlesQuery,
} from "../../../../services/articleApi";
import {
  Button,
  Input,
  Select,
  SelectOption,
  TextArea,
  Upload,
} from "../../../../components";
import {
  useCreateImageMutation,
  useEditImageMutation,
  useGetImagesQuery,
} from "../../../../services/imagesApi";

import { RiDeleteBinLine } from "react-icons/ri";

import "./CreateArticle.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { helperTags, langs } from "../../../../constants";
import copy from "copy-to-clipboard";
import { TextField } from "@mui/material";

const CreateArticle = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const articleId = search.replace("?articleId=", "");
  const { data: articleList, isLoading } = useGetArticlesQuery();
  const { data: imageList, isLoading: imgLoading } =
    useGetImagesQuery("article");
  const [imgError, setImgError] = useState({});
  const [cardImgError, setCardImgError] = useState("");
  const [freeInput, setFreeInput] = useState("");

  const [createImage] = useCreateImageMutation();
  const [editImage] = useEditImageMutation();
  const [
    createArticle,
    { data, isSuccess: createSuccess, isLoading: createLoading, reset },
  ] = useCreateArticleMutation();
  const [
    editArticle,
    {
      data: editImgData,
      isSuccess: editSuccess,
      isLoading: editLoading,
      reset: editReset,
    },
  ] = useEditArticleMutation();

  const [article, setArticle] = useState(() => ({
    image: "",
    date: "",
    tags: [],
    en: {
      title: "",
      description: "",
      fields: [],
    },
    uk: {
      title: "",
      description: "",
      fields: [],
    },
  }));
  const [articleImg, setArticleImg] = useState(() => ({
    component: "article",
    fields: [],
  }));

  useEffect(() => {
    if (articleId && !imgLoading) {
      let imgFieldsClone = imageList.data.filter(
        (field) => field.parentId === articleId
      );

      imgFieldsClone = imgFieldsClone.map((field) => ({
        ...field,
        editable: true,
      }));

      setArticleImg({ ...articleImg, fields: [...imgFieldsClone] });
    }
  }, [articleId, imgLoading, imageList]);

  useEffect(() => {
    if (createSuccess) {
      Promise.all(
        articleImg.fields.map(async (field, index) => {
          const formData = new FormData();

          formData.append("index", field.index);
          formData.append("idx", field.idx);
          formData.append("file", field.file);
          formData.append("component", articleImg.component);
          formData.append("parentId", data.data._id);

          await createImage(formData);
        })
      );

      clean();
      reset();
    }
    if (editSuccess) {
      Promise.all(
        articleImg.fields.map(async (field, index) => {
          const formData = new FormData();

          formData.append("index", field.index);
          formData.append("idx", field.idx);
          formData.append("file", field.file);
          formData.append("component", articleImg.component);

          if (field.editable) {
            formData.append("parentId", articleId);
            formData.append("_id", field._id);
            await editImage(formData);
          } else {
            formData.append("parentId", articleId);
            await createImage(formData);
          }
        })
      );

      clean();
      editReset();
    }
  }, [
    createSuccess,
    editImgData,
    articleImg,
    createImage,
    editImage,
    articleId,
    data,
    reset,
    editSuccess,
    editReset,
  ]);

  useEffect(() => {
    if (articleId && !isLoading) {
      const obj = articleList?.data.find((a) => a._id === articleId);

      const currentArticle = _.cloneDeep(obj);

      setArticle({ ...currentArticle });
    }

    return () => {
      setArticle({
        image: "",
        date: "",
        tags: [],
        en: {
          title: "",
          description: "",
          fields: [],
        },
        uk: {
          title: "",
          description: "",
          fields: [],
        },
      });
    };
  }, [articleId, isLoading, articleList]);

  const onChangeInput = (...argument) => {
    const arg = argument[0];
    const articleClone = { ...article };
    const articleImgClone = { ...articleImg };
    let articleImgFields = [...articleImg.fields];

    const value = arg?.event?.target?.value;

    if (arg.element === "card-image") {
      setCardImgError("");
      if (arg.event.target?.files[0]?.size <= 3145728) {
        articleClone.image = arg.event.target.files[0];
      } else {
        setCardImgError(() => "Img must be less than 3 mb!");
        setTimeout(() => {
          setCardImgError("");
        }, 5000);
      }
    }
    if (arg.element === "menu") {
      if (arg.content === "title") {
        articleClone[arg.lng].fields[arg.index].content.title = value;
      }
      if (arg.content === "menu-item") {
        articleClone[arg.lng].fields[arg.index].content.menu[arg.idx] = value;
      }
    }
    if (arg.element === "text") {
      articleClone[arg.lng].fields[arg.index].content = value;
    }
    if (arg.element === "code") {
      articleClone["en"].fields[arg.index].content = value;
      articleClone["uk"].fields[arg.index].content = value;
    }
    if (arg.element === "code-language") {
      articleClone["en"].fields[arg.index].language = value;
      articleClone["uk"].fields[arg.index].language = value;
    }
    if (arg.element === "code-title") {
      articleClone[arg.lng].fields[arg.index].title = value;
    }
    if (arg.element === "code-text") {
      articleClone[arg.lng].fields[arg.index].text = value;
    }
    if (arg.element === "text-title") {
      articleClone[arg.lng].fields[arg.index].title = value;
    }
    if (arg.element === "images") {
      if (arg.content === "image") {
        setImgError(() => {});
        if (arg.event.target?.files[0]?.size <= 3145728) {
          articleClone["en"].fields[arg.index].content[arg.idx].img =
            arg.event.target?.files[0]?.name;
          articleClone["uk"].fields[arg.index].content[arg.idx].img =
            arg.event.target?.files[0]?.name;

          if (
            articleImgClone.fields.find(
              (i) => i.idx === arg.idx && i.index === arg.index
            )
          ) {
            articleImgFields = articleImgClone.fields.map((i) => {
              if (i.idx === arg.idx && i.index === arg.index) {
                return {
                  ...i,
                  file: arg.event.target?.files[0],
                };
              }
              return i;
            });
          } else {
            articleImgFields = articleImgClone.fields.push({
              file: arg.event.target?.files[0],
              index: arg.index,
              idx: arg.idx,
            });
          }
        } else {
          setImgError(() => ({
            index: arg.index,
            idx: arg.idx,
            message: "Img must be less than 3 mb!",
          }));
          setTimeout(() => {
            setImgError({});
          }, 5000);
        }
      }
      if (arg.content === "description") {
        articleClone[arg.lng].fields[arg.index].content[arg.idx].description =
          value;
      }
    }
    if (arg.element === "quote") {
      if (arg.content === "title") {
        articleClone[arg.lng].fields[arg.index].content.title = value;
      }
      if (arg.content === "description") {
        articleClone[arg.lng].fields[arg.index].content.description = value;
      }
    }
    if (arg.element === "title") {
      articleClone[arg.lng].title = value;
    }
    if (arg.element === "description") {
      articleClone[arg.lng].description = value;
    }
    if (arg.element === "date") {
      articleClone.date = new Date(value);
    }
    if (arg.element === "tags") {
      articleClone.tags = arg.value;
    }

    setArticle({ ...articleClone });
    setArticleImg({
      ...articleImg,
      fields: [...(articleImgFields === undefined ? [] : articleImgFields)],
    });
  };

  const renderFields = (lng) => {
    return article[lng].fields.map((item, index) => {
      if (item.element === "menu") {
        return (
          <div className="menu__group" key={index}>
            <div className="group__header">
              <h4>Menu box</h4>
              <Button onClick={() => removeField("menu", index)}>
                Delete field
              </Button>
              <Button onClick={() => addField("menu-item", index)}>
                Add item
              </Button>
            </div>
            <Input
              placeholder="Menu title"
              value={item.content.title}
              onChange={(event) =>
                onChangeInput({
                  event,
                  index,
                  content: "title",
                  element: "menu",
                  lng,
                })
              }
            />
            <ol className="menu__list">
              {item.content.menu.map((elem, idx) => (
                <li key={idx}>
                  <Input
                    placeholder={`Menu item ${idx + 1}`}
                    value={elem}
                    onChange={(event) =>
                      onChangeInput({
                        event,
                        index,
                        content: "menu-item",
                        element: "menu",
                        idx: idx,
                        lng,
                      })
                    }
                  />
                  <Button onClick={() => removeField("menu-item", index, idx)}>
                    <RiDeleteBinLine />
                  </Button>
                </li>
              ))}
            </ol>
          </div>
        );
      }
      if (item.element === "text") {
        return (
          <div className="text__group" key={index}>
            <div className="group__header">
              <h4>Text box</h4>
              <Button onClick={() => removeField("text", index)}>
                Delete field
              </Button>
            </div>
            <Input
              placeholder="Field title"
              value={item.title}
              onChange={(event) =>
                onChangeInput({
                  event,
                  index,
                  element: "text-title",
                  lng,
                })
              }
            />
            <TextArea
              value={item.content}
              placeholder="Field text"
              onChange={(event) =>
                onChangeInput({
                  event,
                  index,
                  element: "text",
                  lng,
                })
              }
              row={5}
            />
          </div>
        );
      }
      if (item.element === "code") {
        return (
          <div className="text__group" key={index}>
            <div className="group__header">
              <h4>Code box</h4>
              <Button onClick={() => removeField("code", index)}>
                Delete field
              </Button>
            </div>
            <Input
              placeholder="Code field title"
              value={item.title}
              onChange={(event) =>
                onChangeInput({
                  event,
                  index,
                  element: "code-title",
                  lng,
                })
              }
            />
            <TextArea
              value={item.text}
              placeholder="Code text"
              onChange={(event) =>
                onChangeInput({
                  event,
                  index,
                  element: "code-text",
                  lng,
                })
              }
              row={5}
            />
            <SelectOption
              value={item.language}
              arr={langs}
              disabled={!langs}
              title="Code language"
              lng={lng}
              onChange={(event) =>
                onChangeInput({
                  element: "code-language",
                  index,
                  event,
                  lng,
                })
              }
            />
            <TextArea
              value={item.content}
              placeholder="Field code"
              onChange={(event) =>
                onChangeInput({
                  event,
                  index,
                  element: "code",
                  lng,
                })
              }
              row={5}
            />
          </div>
        );
      }
      if (item.element === "images") {
        return (
          <div className="images__group" key={index}>
            <div className="group__header">
              <h4>Image box </h4>
              <Button onClick={() => removeField("images", index)}>
                Delete field
              </Button>
              <Button onClick={() => addField("image", index)}>
                Add image
              </Button>
            </div>
            {item.content.map((elem, idx) => (
              <div key={idx}>
                <div className="box_header">
                  <h5>Image {idx + 1}</h5>
                  <Button onClick={() => removeField("image", index, idx)}>
                    <RiDeleteBinLine />
                  </Button>
                  <span className="img__error">
                    {imgError?.message &&
                    imgError?.index === index &&
                    imgError?.idx === idx
                      ? imgError.message
                      : ""}
                  </span>
                </div>
                <div className="group__box">
                  <Upload
                    value={elem.img}
                    onChange={(event) =>
                      onChangeInput({
                        index,
                        event,
                        element: "images",
                        content: "image",
                        lng,
                        idx,
                      })
                    }
                  />
                  <Input
                    placeholder={`Image description ${index + 1}`}
                    value={elem.description}
                    onChange={(event) =>
                      onChangeInput({
                        event,
                        index,
                        element: "images",
                        content: "description",
                        idx,
                        lng,
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        );
      }
      if (item.element === "quote") {
        return (
          <div className="quote__group" key={index}>
            <div className="group__header">
              <h4>Quote box</h4>
              <Button onClick={() => removeField("quote", index)}>
                Delete field
              </Button>
            </div>
            <Input
              placeholder={`Quote title`}
              value={item.content.title}
              onChange={(event) =>
                onChangeInput({
                  event,
                  index,
                  content: "title",
                  element: "quote",
                  lng,
                })
              }
            />
            <Input
              placeholder={`Quote description`}
              value={item.content.description}
              onChange={(event) =>
                onChangeInput({
                  event,
                  index,
                  content: "description",
                  element: "quote",
                  lng,
                })
              }
            />
          </div>
        );
      } else {
        return <p>Element not found</p>;
      }
    });
  };

  const addField = (field, idx) => {
    const textTemplate = {
      en: {
        element: "text",
        content: "",
        title: "",
      },
      uk: {
        element: "text",
        content: "",
        title: "",
      },
    };

    const codeTemplate = {
      en: {
        element: "code",
        content: "",
        language: "",
        title: "",
      },
      uk: {
        element: "code",
        content: "",
        language: "",
        title: "",
      },
    };

    const menuTemplate = {
      en: {
        element: "menu",
        content: {
          title: "",
          menu: [""],
        },
      },
      uk: {
        element: "menu",
        content: {
          title: "",
          menu: [""],
        },
      },
    };

    const imagesTemplate = {
      en: {
        element: "images",
        content: [{ img: "", description: "" }],
      },
      uk: {
        element: "images",
        content: [{ img: "", description: "" }],
      },
    };

    const quoteTemplate = {
      en: {
        element: "quote",
        content: {
          title: "",
          description: "",
        },
      },
      uk: {
        element: "quote",
        content: {
          title: "",
          description: "",
        },
      },
    };

    let articleClone = { ...article };
    let enFields = [...articleClone.en.fields];
    let ukFields = [...articleClone.uk.fields];

    if (field === "text") {
      enFields.push({ ...textTemplate.en });
      ukFields.push({ ...textTemplate.uk });
    }
    if (field === "menu") {
      enFields.push({ ...menuTemplate.en });
      ukFields.push({ ...menuTemplate.uk });
    }
    if (field === "images") {
      enFields.push({ ...imagesTemplate.en });
      ukFields.push({ ...imagesTemplate.uk });
    }
    if (field === "quote") {
      enFields.push({ ...quoteTemplate.en });
      ukFields.push({ ...quoteTemplate.uk });
    }
    if (field === "code") {
      enFields.push({ ...codeTemplate.en });
      ukFields.push({ ...codeTemplate.uk });
    }
    if (field === "menu-item") {
      enFields = enFields.map((f, index) => {
        if (f.element === "menu" && index === idx) {
          return {
            ...f,
            content: { ...f.content, menu: [...f.content.menu, ""] },
          };
        }
        return f;
      });
      ukFields = ukFields.map((f, index) => {
        if (f.element === "menu" && index === idx) {
          return {
            ...f,
            content: { ...f.content, menu: [...f.content.menu, ""] },
          };
        }
        return f;
      });
    }
    if (field === "image") {
      enFields = enFields.map((f, index) => {
        if (f.element === "images" && index === idx) {
          return {
            ...f,
            content: [...f.content, { img: "", description: "" }],
          };
        }
        return f;
      });
      ukFields = ukFields.map((f, index) => {
        if (f.element === "images" && index === idx) {
          return {
            ...f,
            content: [...f.content, { img: "", description: "" }],
          };
        }
        return f;
      });
    }

    articleClone.en.fields = [...enFields];
    articleClone.uk.fields = [...ukFields];

    setArticle({ ...articleClone });
  };

  const removeField = (field, idx, i) => {
    let articleClone = { ...article };
    let enFields = [...articleClone.en.fields];
    let ukFields = [...articleClone.uk.fields];

    let articleImgFieldsClone = [...articleImg.fields];

    let filteredEnFields = [];
    let filteredUkFields = [];
    let filteredImgFields = [];

    if (
      field === "menu" ||
      field === "images" ||
      field === "quote" ||
      field === "text" ||
      field === "code"
    ) {
      filteredEnFields = enFields.filter((f, index) => {
        return index !== idx;
      });

      filteredUkFields = ukFields.filter((f, index) => {
        return index !== idx;
      });

      filteredImgFields = articleImgFieldsClone.filter((f, index) => {
        return f.index !== idx;
      });
    } else if (field === "menu-item") {
      filteredEnFields = enFields.map((f, index) => {
        if (f.element === "menu" && index === idx) {
          let fieldContentMenu = f.content.menu.filter(
            (item, idxI) => idxI !== i
          );
          return {
            ...f,
            content: { ...f.content, menu: [...fieldContentMenu] },
          };
        } else {
          return f;
        }
      });
      filteredUkFields = ukFields.map((f, index) => {
        if (f.element === "menu" && index === idx) {
          let fieldContentMenu = f.content.menu.filter(
            (item, idxI) => idxI !== i
          );
          return {
            ...f,
            content: { ...f.content, menu: [...fieldContentMenu] },
          };
        } else {
          return f;
        }
      });
    } else if (field === "image") {
      filteredEnFields = enFields.map((f, index) => {
        if (f.element === "images" && index === idx) {
          let fieldContent = f.content.filter((item, idxI) => idxI !== i);
          return {
            ...f,
            content: [...fieldContent],
          };
        } else {
          return f;
        }
      });

      filteredUkFields = ukFields.map((f, index) => {
        if (f.element === "images" && index === idx) {
          let fieldContent = f.content.filter((item, idxI) => idxI !== i);
          return {
            ...f,
            content: [...fieldContent],
          };
        } else {
          return f;
        }
      });

      filteredImgFields = filteredImgFields.filter((f) => f.idx !== i);
    }

    articleClone.en.fields = [...filteredEnFields];
    articleClone.uk.fields = [...filteredUkFields];
    articleImgFieldsClone = [...filteredImgFields];

    setArticle({ ...articleClone });
    setArticleImg({ ...articleImg, fields: [...articleImgFieldsClone] });
  };

  const onSubmitHandler = async () => {
    const formData = new FormData();

    if (article.date) {
      formData.append("date", article.date);
    }
    if (article.image) {
      formData.append("image", article.image);
    }

    formData.append("tags", JSON.stringify(article.tags));
    formData.append("en", JSON.stringify(article.en));
    formData.append("uk", JSON.stringify(article.uk));
    if (articleId) {
      formData.append("_id", articleId);
      editArticle(formData);
    } else {
      createArticle(formData);
    }
  };

  const clean = () => {
    setArticle({
      image: "",
      date: "",
      tags: [],
      en: {
        title: "",
        description: "",
        fields: [],
      },
      uk: {
        title: "",
        description: "",
        fields: [],
      },
    });
    setArticleImg({
      component: "article",
      fields: [],
    });
    navigate("/articles/form");
  };

  return (
    <div className="articles__modal">
      <div className="course__box">
        <div className="modal__content">
          <h2>Article Form</h2>
          <div className="modal__main">
            <div className="main__box">
              <h3>EN - forms</h3>
              <div className="input__group">
                <Input
                  value={article.en.title}
                  placeholder="Title"
                  onChange={(event) =>
                    onChangeInput({
                      element: "title",
                      event,
                      lng: "en",
                    })
                  }
                />
              </div>
              <div className="input__group">
                <Input
                  placeholder="Card description"
                  value={article.en.description}
                  onChange={(event) =>
                    onChangeInput({
                      element: "description",
                      event,
                      lng: "en",
                    })
                  }
                />
              </div>
              <div className="input__group">
                <span className="img__error">
                  {cardImgError ? cardImgError : ""}
                </span>
                <div className="group__box">
                  <Upload
                    value={article.image?.name || article.image}
                    onChange={(event) =>
                      onChangeInput({
                        event,
                        element: "card-image",
                      })
                    }
                  />
                </div>
              </div>
              <div className="input__group">
                <Input
                  type="date"
                  value={moment(new Date(article.date)).format("yyyy-MM-DD")}
                  onChange={(event) =>
                    onChangeInput({
                      element: "date",
                      event,
                    })
                  }
                />
              </div>
              <div className="input__group">
                <Select
                  value={article?.tags}
                  onChange={(event, value) =>
                    onChangeInput({
                      element: "tags",
                      event,
                      value,
                    })
                  }
                />
              </div>
              <div className="input__list">
                <h3>Article fields</h3>
                <div className="article__buttons">
                  <Button onClick={() => addField("text")}>Add text</Button>
                  <Button onClick={() => addField("menu")}>Add menu</Button>
                  <Button onClick={() => addField("images")}>Add images</Button>
                  <Button onClick={() => addField("quote")}>Add quote</Button>
                  <Button onClick={() => addField("code")}>Add code</Button>
                </div>
                {renderFields("en")}
              </div>
            </div>
            <div className="main__box">
              <h3>UK - forms</h3>
              <div className="input__group">
                <Input
                  value={article.uk.title}
                  placeholder="Title"
                  onChange={(event) =>
                    onChangeInput({
                      element: "title",
                      event,
                      lng: "uk",
                    })
                  }
                />
              </div>
              <div className="input__group">
                <Input
                  placeholder="Card description"
                  value={article.uk.description}
                  onChange={(event) =>
                    onChangeInput({
                      element: "description",
                      event,
                      lng: "uk",
                    })
                  }
                />
              </div>
              <div className="input__group">
                <span className="img__error">
                  {cardImgError ? cardImgError : ""}
                </span>
                <div className="group__box">
                  <Upload
                    value={article.image?.name || article.image}
                    onChange={(event) =>
                      onChangeInput({
                        event,
                        element: "card-image",
                      })
                    }
                  />
                </div>
              </div>
              <div className="input__group">
                <Input
                  type="date"
                  value={moment(new Date(article.date)).format("yyyy-MM-DD")}
                  onChange={(event) =>
                    onChangeInput({
                      element: "date",
                      event,
                    })
                  }
                />
              </div>
              <div className="input__group">
                <Select
                  value={article?.tags}
                  onChange={(event, value) =>
                    onChangeInput({
                      element: "tags",
                      event,
                      value,
                    })
                  }
                />
              </div>
              <div className="input__list">
                <h3>Article fields</h3>
                <div className="article__buttons">
                {helperTags.map((elem, index) => (
                  <div class="tooltip" key={index}>
                    <span className="tooltiptext" id={elem.label}>
                      Copy to clipboard
                    </span>
                    <Button
                      variant="contained"
                      onClick={() => {
                        copy(elem.content);
                        var tooltip = document.getElementById(elem.label);
                        tooltip.innerText = "Copied: " + elem.content;
                      }}
                    >
                      {elem.label}
                    </Button>
                  </div>
                ))}
                <TextField
                  style={{ margin: 0, width: 120 }}
                  id="free-tooltip"
                  onChange={(e) => setFreeInput(e.target.value)}
                  value={freeInput}
                />

                <div class="tooltip">
                  <Button
                    onClick={() => {
                      copy(freeInput);
                      var tooltip = document.getElementById(freeInput);
                      tooltip.innerText = "Copied: " + freeInput;
                    }}
                  >
                    <span class="tooltiptext" id="myFreeTooltip">
                      Copy to clipboard
                    </span>
                    Copy text
                  </Button>
                </div>
              </div>
                {renderFields("uk")}
              </div>
            </div>
            <div className="box__submit">
              <Button
                onClick={onSubmitHandler}
                style={{ padding: "15px 45px" }}
              >
                {!articleId ? "Create article" : "Edit article"}
              </Button>
              {createLoading || editLoading ? "...Loading" : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
