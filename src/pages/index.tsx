import Head from "next/head";
import moment from "moment";
import type { NextPageWithLayout } from "./_app";
import Layout from "@components/Layout";
import {
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleFill,
  RiStarFill,
  RiStarLine,
} from "react-icons/ri";
import { CiCirclePlus } from "react-icons/ci";
import { Formik, useFormikContext } from "formik";
import debounce from "just-debounce-it";
import { useCallback, useEffect } from "react";
import { api } from "@utils/api";
import classNames from "classnames";

type InitialData = {
  date: string | Date;
  mood: number | undefined;
  now: { priority: boolean; completed: boolean; task: string }[];
  next: { priority: boolean; completed: boolean; task: string }[];
  notYet: { priority: boolean; completed: boolean; task: string }[];
};

const initialData: InitialData = {
  date: moment().format("YYYY-MM-DD"),
  mood: undefined,
  now: [
    {
      priority: false,
      completed: false,
      task: "",
    },
    {
      priority: false,
      completed: false,
      task: "",
    },
  ],
  next: [
    {
      priority: false,
      completed: false,
      task: "",
    },
    {
      priority: false,
      completed: false,
      task: "",
    },
  ],
  notYet: [
    {
      priority: false,
      completed: false,
      task: "",
    },
    {
      priority: false,
      completed: false,
      task: "",
    },
  ],
};

const AutoSave = () => {
  const formik = useFormikContext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSubmit = useCallback(
    debounce(() => formik.submitForm().then(() => console.log("saved")), 300),
    [formik.submitForm]
  );

  useEffect(() => {
    debouncedSubmit();
  }, [debouncedSubmit, formik.values]);

  return <span></span>;
};

const Home: NextPageWithLayout = () => {
  const utils = api.useContext();
  const todo = api.todo.getTodo.useQuery({
    date: moment().format("YYYY-MM-DD"),
  });
  const mutation = api.todo.upsertTodo.useMutation({
    onSuccess: async () => {
      await utils.todo.getTodo.invalidate({
        date: moment().format("YYYY-MM-DD"),
      });
    },
  });
  const moodMutation = api.todo.upsertMood.useMutation({
    onSuccess: async () => {
      await utils.todo.getTodo.invalidate({
        date: moment().format("YYYY-MM-DD"),
      });
    },
  });

  const handleMoodChange = (mood: number) =>
    moodMutation.mutate({ date: moment().format("YYYY-MM-DD"), mood });

  return (
    <>
      <Head>
        <title>Strive</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto max-w-5xl px-4">
        {!todo.isLoading && (
          <>
            <div className="sticky top-0 flex items-center justify-between bg-white py-8">
              <h1 className="text-5xl uppercase text-gray-900 underline underline-offset-8">
                DAILY TO-DO&apos;S
              </h1>
              <div>
                <div className="flex items-center border-b border-gray-700 text-xl text-gray-700">
                  <div className="pr-4">DATE:</div>
                  <div className="w-full text-center">
                    {moment().format("DD-MM-YYYY").toString()}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-xl uppercase text-gray-700">
                    How are you feeling today?
                  </h3>
                  <div className="mt-2 flex items-center justify-end space-x-4 text-4xl">
                    <button
                      onClick={() => handleMoodChange(1)}
                      className={
                        todo.data?.mood === 1 ? "opacity-100" : "opacity-40"
                      }
                    >
                      😢
                    </button>
                    <button
                      onClick={() => handleMoodChange(2)}
                      className={
                        todo.data?.mood === 2 ? "opacity-100" : "opacity-40"
                      }
                    >
                      😐
                    </button>
                    <button
                      onClick={() => handleMoodChange(3)}
                      className={
                        todo.data?.mood === 3 ? "opacity-100" : "opacity-40"
                      }
                    >
                      😀
                    </button>
                    <button
                      onClick={() => handleMoodChange(4)}
                      className={
                        todo.data?.mood === 4 ? "opacity-100" : "opacity-40"
                      }
                    >
                      🤩
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <Formik
              initialValues={
                todo.data ? (todo.data as InitialData) : initialData
              }
              onSubmit={(values) => mutation.mutate(values)}
            >
              {({ handleSubmit, values, setFieldValue }) => (
                <form className="space-y-8 pt-16" onSubmit={handleSubmit}>
                  <AutoSave />
                  <div>
                    <h2 className="mb-2 flex items-center justify-between text-4xl uppercase text-gray-900">
                      <span>Now</span>
                      <button
                        type="button"
                        className="ml-4 text-gray-400"
                        onClick={() =>
                          setFieldValue("now", [
                            ...values.now,
                            {
                              priority: false,
                              completed: false,
                              task: "",
                            },
                          ])
                        }
                      >
                        <CiCirclePlus className="h-8 w-8" />
                      </button>
                    </h2>
                    <p className="text-xl uppercase text-gray-700">
                      The most important tasks of today.
                    </p>
                    {values.now.map((n, nIndex) => (
                      <div key={nIndex} className="py-2">
                        <div className="flex items-center space-x-1 border-b border-gray-300 py-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFieldValue(
                                `now.${nIndex}.priority`,
                                !values.now[nIndex]?.priority
                              )
                            }
                          >
                            {values.now[nIndex]?.priority ? (
                              <RiStarFill className="h-8 w-8 text-yellow-500" />
                            ) : (
                              <RiStarLine className="h-8 w-8 text-gray-500" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFieldValue(
                                `now.${nIndex}.completed`,
                                !values.now[nIndex]?.completed
                              )
                            }
                          >
                            {values.now[nIndex]?.completed ? (
                              <RiCheckboxCircleFill className="h-8 w-8 text-green-500" />
                            ) : (
                              <RiCheckboxBlankCircleLine className="h-8 w-8 text-gray-500" />
                            )}
                          </button>
                          <input
                            name={`now.${nIndex}.task`}
                            type="text"
                            className={classNames(
                              "w-full border-none text-xl uppercase text-gray-700 outline-none focus:outline-none focus:ring-0",
                              values.now[nIndex]?.completed && "line-through"
                            )}
                            value={values.now[nIndex]?.task}
                            onChange={(e) =>
                              setFieldValue(
                                `now.${nIndex}.task`,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h2 className="mb-2 flex items-center justify-between text-4xl uppercase text-gray-900">
                      <span>Next</span>
                      <button
                        type="button"
                        className="ml-4 text-gray-400"
                        onClick={() =>
                          setFieldValue("next", [
                            ...values.next,
                            {
                              priority: false,
                              completed: false,
                              task: "",
                            },
                          ])
                        }
                      >
                        <CiCirclePlus className="h-8 w-8" />
                      </button>
                    </h2>
                    <p className="text-xl uppercase text-gray-700">
                      When you&apos;ve completed the now tasks.
                    </p>
                    {values.next.map((n, nIndex) => (
                      <div key={nIndex} className="py-2">
                        <div className="flex items-center space-x-1 border-b border-gray-300 py-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFieldValue(
                                `next.${nIndex}.priority`,
                                !values.next[nIndex]?.priority
                              )
                            }
                          >
                            {values.next[nIndex]?.priority ? (
                              <RiStarFill className="h-8 w-8 text-yellow-500" />
                            ) : (
                              <RiStarLine className="h-8 w-8 text-gray-500" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFieldValue(
                                `next.${nIndex}.completed`,
                                !values.next[nIndex]?.completed
                              )
                            }
                          >
                            {values.next[nIndex]?.completed ? (
                              <RiCheckboxCircleFill className="h-8 w-8 text-green-500" />
                            ) : (
                              <RiCheckboxBlankCircleLine className="h-8 w-8 text-gray-500" />
                            )}
                          </button>
                          <input
                            name={`next.${nIndex}.task`}
                            type="text"
                            className={classNames(
                              "w-full border-none text-xl uppercase text-gray-700 outline-none focus:outline-none focus:ring-0",
                              values.next[nIndex]?.completed && "line-through"
                            )}
                            value={values.next[nIndex]?.task}
                            onChange={(e) =>
                              setFieldValue(
                                `next.${nIndex}.task`,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h2 className="mb-2 flex items-center justify-between text-4xl uppercase text-gray-900">
                      <span>Not yet</span>
                      <button
                        type="button"
                        className="ml-4 text-gray-400"
                        onClick={() =>
                          setFieldValue("notYet", [
                            ...values.notYet,
                            {
                              priority: false,
                              completed: false,
                              task: "",
                            },
                          ])
                        }
                      >
                        <CiCirclePlus className="h-8 w-8" />
                      </button>
                    </h2>
                    <p className="text-xl uppercase text-gray-700">
                      When you&apos;re super productive.
                    </p>
                    {values.notYet.map((n, nIndex) => (
                      <div key={nIndex} className="py-2">
                        <div className="flex items-center space-x-1 border-b border-gray-300 py-2">
                          <button
                            type="button"
                            onClick={() =>
                              setFieldValue(
                                `notYet.${nIndex}.priority`,
                                !values.notYet[nIndex]?.priority
                              )
                            }
                          >
                            {values.notYet[nIndex]?.priority ? (
                              <RiStarFill className="h-8 w-8 text-yellow-500" />
                            ) : (
                              <RiStarLine className="h-8 w-8 text-gray-500" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFieldValue(
                                `notYet.${nIndex}.completed`,
                                !values.notYet[nIndex]?.completed
                              )
                            }
                          >
                            {values.notYet[nIndex]?.completed ? (
                              <RiCheckboxCircleFill className="h-8 w-8 text-green-500" />
                            ) : (
                              <RiCheckboxBlankCircleLine className="h-8 w-8 text-gray-500" />
                            )}
                          </button>
                          <input
                            name={`notYet.${nIndex}.task`}
                            type="text"
                            className={classNames(
                              "w-full border-none text-xl uppercase text-gray-700 outline-none focus:outline-none focus:ring-0",
                              values.notYet[nIndex]?.completed && "line-through"
                            )}
                            value={values.notYet[nIndex]?.task}
                            onChange={(e) =>
                              setFieldValue(
                                `notYet.${nIndex}.task`,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </form>
              )}
            </Formik>
          </>
        )}
      </div>
    </>
  );
};

Home.getLayout = (page) => <Layout>{page}</Layout>;

export default Home;
