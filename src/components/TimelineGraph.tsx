import { useEffect, useState } from "react";
import { defaultDurationMultiplier } from "../constants/skills";
import { defaultHeight } from "../constants/sizes";
import { start } from "repl";

export default function TimelineGraph({
    attackItems, 
    buffItems, 
    checkedUE2
}: {
    attackItems: AttackSkill[];
    buffItems: BuffSkill[];
    checkedUE2: Record<string, boolean>;
}
) {
    const [skillTypes, setSkillTypes] = useState<Array<[string, string]>>([]);
    const [maxTime, setMaxTime] = useState<number>(600);
    const [minTime, setMinTime] = useState<number>(0);
    
    useEffect(() => {
        const combined = [...attackItems, ...buffItems];

        // 중복 없이 (character, detail) 쌍만 뽑아서 배열 생성
        const uniqueSet = new Set<string>();
        const newSkillTypes: [string, string][] = [];

        combined.forEach(item => {
            const key = `${item.character}-${item.detail}`;
            if (!uniqueSet.has(key)) {
            uniqueSet.add(key);
            newSkillTypes.push([item.character, item.detail]);
            }
        });

        setSkillTypes(newSkillTypes);
    }, [attackItems, buffItems]);

    useEffect(() => {
        var tempMax = 0;
        var tempMin = 600;

        attackItems.forEach(item => {
            if(item.startTime > tempMax) tempMax = item.startTime;
            const endTime = item.startTime - item.allDelays[item.allDelays.length - 1];
            if(endTime < tempMin) tempMin = endTime;
        });

        buffItems.forEach(item => {
            if(item.startTime > tempMax) tempMax = item.startTime;
            const isChecked = checkedUE2[item.character] || false;
            const endTime = item.startTime - item.delay - item.duration * (isChecked ? defaultDurationMultiplier : 1);
            if(endTime < tempMin) tempMin = endTime;
        })

        tempMax = Math.ceil(tempMax / 10) * 10;
        tempMin = Math.floor(tempMin / 10) * 10;

        setMaxTime(tempMax);
        setMinTime(tempMin);

    }, [attackItems, buffItems, checkedUE2])

    const [widthMult, setWidthMult] = useState<number>(1);
    const [widthMultInput, setWidthMultInput] = useState<string>('1');
    const [heightMult, setHeightMult] = useState<number>(1);
    const [heightMultInput, setHeightMultInput] = useState<string>('1');

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '') {
            setWidthMultInput('');
            return;
        }

        const num = parseFloat(value);

        if (!isNaN(num)) {
            setWidthMultInput(num < 1 ? '1' : value);
            setWidthMult(num < 1 ? 1 : num);
        }
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (value === '') {
            setHeightMultInput('');
            return;
        }

        const num = parseFloat(value);

        if (!isNaN(num)) {
            setHeightMultInput(num < 1 ? '1' : value);
            setHeightMult(num < 1 ? 1 : num);
        }
    };
    
    // const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // useEffect(() => {
    //     const handleResize = () => setWindowWidth(window.innerWidth);

    //     window.addEventListener('resize', handleResize);

    //     return () => window.removeEventListener('resize', handleResize);
    // }, []);

    return (
        <div>
            
            {/* <h3>TL 표기 시작/종료</h3>
            <div>
                <b>시작: </b> {maxTime.toFixed(3)}
                <br />
                <b>종료: </b> {minTime.toFixed(3)}
            </div>

            <h3>공격 타임라인 (스킬 단위)</h3>
            {attackItems.map((item, i) => (
                <div key={i} style={{ marginBottom: "14px" }}>
                <b>캐릭터:</b> {item.character} <b>타입:</b> {item.detail}
                <br />
                <b>스킬 ID:</b> {skillTypes.findIndex(([character, detail]) => character === item.character && detail === item.detail)}
                <br />
                <span>스킬 실행 시간: {item.startTime.toFixed(3)}초</span>
                <br />
                <span>
                    모든 타수 시점:{" "}
                    {item.allDelays
                    .map((d) => (item.startTime + d).toFixed(3))
                    .join(", ")}
                    초
                </span>
                </div>
            ))}

            <h3>버프 타임라인</h3>
            {buffItems.map((item, i) => {
                const isChecked = item.UE2 && checkedUE2[item.character];
                const duration =
                item.duration * (isChecked ? defaultDurationMultiplier : 1);

                return (
                <div key={i}>
                    [buff] 사용 시간: {item.startTime.toFixed(3)}초, 캐릭터: {item.character},
                    시작 시간: {(item.startTime - item.delay).toFixed(3)}초, 
                    종료 시간: {(item.startTime - item.delay - duration).toFixed(3)}초, 
                    스킬 종류: {item.detail}, 지속시간: {duration.toFixed(2)}초, 
                    스킬 ID: {skillTypes.findIndex(([character, detail]) => character === item.character && detail === item.detail)}
                </div>
                );
            })} */}

            <h3>시각화 블럭</h3>
            <div style={{ padding: '10px' }}>
                <div style={{
                    position: 'relative',
                    width: '100%', 
                    height: `${defaultHeight * skillTypes.length + 20}px`, 
                    boxSizing: 'border-box', 
                    overflow: 'auto'
                }}>
                {
                    skillTypes.map((item, i) => {
                        const [character, detail] = item;
                        return (
                            <div style={{
                                width: `${100 * widthMult}%`, 
                                height: `${defaultHeight * heightMult}px`, 
                                boxSizing: 'border-box',
                                backgroundColor: '#00ff0033'
                            }}>
                                ID: {i}, 스킬 종류: {character} {detail}
                            </div>
                        );
                    })
                }
                {
                    attackItems.map((item, _) => {
                        const {startTime, character, detail, allDelays} = item;
                        const id = skillTypes.findIndex(([char, det]) => char === character && det === detail);
                        return (
                            <div style={{
                                position: 'absolute',
                                left: `${widthMult * (maxTime - startTime) * 100 / (maxTime - minTime)}%`,
                                width: `${widthMult * (allDelays[allDelays.length - 1]) * 100 / (maxTime - minTime)}%`,
                                top: defaultHeight * heightMult * id,
                                height: defaultHeight * heightMult,
                                borderLeft: '1px solid black',
                                backgroundColor: '#0000ff33'
                            }}>
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%'
                                }}>
                                    {character} {detail}
                                    {
                                        allDelays.map((item, _) => {
                                            console.log(item * 100 / allDelays[allDelays.length - 1])
                                            return (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    width: `${item * 100 / allDelays[allDelays.length - 1]}%`,
                                                    height: `${heightMult * defaultHeight * skillTypes.length}px`,
                                                    borderRight: '1px solid black'
                                                }}></div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        );
                    })
                }
                {
                    buffItems.map((item, i) => {
                        const {startTime, delay, duration, character, detail} = item;
                        const id = skillTypes.findIndex(([char, det]) => char === character && det === detail);
                        const exactDuration = duration * (checkedUE2[character] ? defaultDurationMultiplier : 1);
                        return (
                            <div style={{
                                position: 'absolute',
                                left: `${widthMult * (maxTime - startTime) * 100 / (maxTime - minTime)}%`,
                                width: `${widthMult * (delay + exactDuration) * 100 / (maxTime - minTime)}%`,
                                top: defaultHeight * heightMult * id,
                                height: defaultHeight * heightMult,
                                borderLeft: '1px solid black',
                            }}>
                                <div style={{
                                    position: 'relative',
                                    width: '100%',
                                    height: '100%'
                                }}>
                                    {character} {detail}
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: `${delay * 100 / (delay + exactDuration)}%`,
                                        width: `${exactDuration * 100 / (delay + exactDuration)}%`,
                                        height: '100%',
                                        borderLeft: '1px solid black',
                                        borderRight: '1px solid black',
                                        backgroundColor: '#0000ff33'
                                    }}>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                }
                </div>
            </div>

            <h3>가로/세로 배율</h3>
            <div>
            <div>
                <label>
                Width Multiplier:
                <input
                    type="number"
                    step="0.1"
                    value={widthMultInput}
                    onChange={handleWidthChange}
                    min="1"
                />
                </label>
            </div>
            <div>
                <label>
                Height Multiplier:
                <input
                    type="number"
                    step="0.1"
                    value={heightMultInput}
                    onChange={handleHeightChange}
                    min="1"
                />
                </label>
            </div>
            <div>
                현재 Width Multiplier: {widthMult}
            </div>
            <div>
                현재 Height Multiplier: {heightMult}
            </div>
            </div>
        </div>
    );
}