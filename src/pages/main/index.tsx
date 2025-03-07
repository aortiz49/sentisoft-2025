/* eslint-disable jsx-a11y/media-has-caption */
import { Snippet } from '@heroui/snippet';
import { Button } from '@heroui/button';
import { useState, useRef } from 'react';
import { Card, CardBody } from '@heroui/card';

import CustomAudioPlayer from './CustomAudioPlayer';
import { questions } from './config';

import { title, subtitle } from '@/components/primitives';
import DefaultLayout from '@/layouts/default';

interface QuestionWithAudio {
  question: string;
  audioURL: string | null;
  isRecording: boolean;
}

export default function IndexPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [renderOption, setRenderOption] = useState(true);
  const [started, setStarted] = useState(false);
  const [questionsWithAudio, setQuestionsWithAudio] = useState<
    QuestionWithAudio[]
  >([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStart = () => {
    setIsLoading(true);
    setStarted(true);
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3).map((q) => ({
      question: q,
      audioURL: null,
      isRecording: false,
    }));

    setTimeout(() => {
      setQuestionsWithAudio(selected);
      setIsLoading(false);
      setRenderOption(false);
    }, 1000);
  };

  const startRecording = async (index: number) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorderRef.current = new MediaRecorder(stream);
    audioChunksRef.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: 'audio/wav',
      });
      const audioURL = URL.createObjectURL(audioBlob);

      setQuestionsWithAudio((prev) =>
        prev.map((q, i) =>
          i === index ? { ...q, audioURL, isRecording: false } : q
        )
      );
    };

    mediaRecorderRef.current.start();
    setQuestionsWithAudio((prev) =>
      prev.map((q, i) => (i === index ? { ...q, isRecording: true } : q))
    );
  };

  const stopRecording = (index: number) => {
    mediaRecorderRef.current?.stop();
    setQuestionsWithAudio((prev) =>
      prev.map((q, i) => (i === index ? { ...q, isRecording: false } : q))
    );
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        {!started && (
          <div className="inline-block max-w-lg text-center justify-center">
            <span className={title()}>Tech Skills Open Doors.&nbsp;</span>
            <span className={title({ color: 'violet' })}>
              Soft Skills&nbsp;
            </span>
            <br />
            <span className={title()}>Get You Through Them.&nbsp;</span>
            <div className={subtitle({ class: 'mt-4' })}>
              Ace your next behavioral interview with AI-powered practice
              sessions.
            </div>
          </div>
        )}
        {renderOption && (
          <div className="mt-8">
            <Snippet hideCopyButton hideSymbol variant="bordered">
              <span>
                Start your first interview{' '}
                <Button
                  className="bg-gradient-to-tr from-[#FF1CF7] to-[#b249f8] text-white shadow-lg"
                  isLoading={isLoading}
                  radius="full"
                  variant="shadow"
                  onPress={handleStart}
                >
                  <p className="leading-none">Start</p>
                </Button>
              </span>
            </Snippet>
          </div>
        )}
        {questionsWithAudio.length > 0 && (
          <Card
            isBlurred
            className="border-none bg-background/60 dark:bg-default-100/50 max-w-[610px]"
            shadow="sm"
          >
            <CardBody>
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-foreground/90">
                  Behavioral Interview Questions
                </h3>
                {questionsWithAudio.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 border-b border-foreground/10 pb-4 last:border-none"
                  >
                    <p className="text-foreground/80 font-medium">
                      Question {index + 1}:
                    </p>
                    <p className="text-foreground/90">{item.question}</p>

                    <div className="flex gap-2 mt-2">
                      <Button
                        className={
                          item.isRecording ? 'bg-red-500' : 'bg-green-500'
                        }
                        radius="full"
                        onPress={() =>
                          item.isRecording
                            ? stopRecording(index)
                            : startRecording(index)
                        }
                      >
                        {item.isRecording ? 'Stop Recording' : 'Record Answer'}
                      </Button>
                    </div>

                    {item.audioURL && (
                      <CustomAudioPlayer audioURL={item.audioURL} />
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </section>
    </DefaultLayout>
  );
}
