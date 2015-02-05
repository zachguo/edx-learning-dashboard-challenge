#!/usr/bin/env python

# 1. This python script generates JSON data necessary for d3 visualization. Since all JSONs are already included in the repo, so there's no need to run this script.
# 2. This is a dirty and one-time-use script containing few comments and many hacky steps. I didn't take efficiency and readability into account when writing it.

import csv
import json
from collections import defaultdict

CSV_FOLDER_PATH = "../../data/"


def clean(name):
    return name.rpartition('_')[-1].replace(' ', '').lower()


def generate_course_structure():

    def get_structure_from(filepath):
        structure = {"children": {}, "parent": {}}
        base = {}

        def check_n_append_child(key, child):
            if child not in structure["children"][key]:
                structure["children"][key].append(child)

        def check_n_init_children(key):
            if key not in structure["children"]:
                structure["children"][key] = []

        def check_n_add_parent(key, parent):
            if key not in structure["parent"]:
                structure["parent"][key] = parent

        with open(filepath) as f:
            reader = csv.DictReader(f)
            for row in reader:
                id = clean(row["id"])
                section = clean(row["section"])
                subsection = clean(row["subsection"])
                base_val = int(row["max_points"]) if "max_points" in row else int(row["duration_seconds"])
                check_n_init_children("overall")
                check_n_init_children(section)
                check_n_init_children(subsection)
                check_n_append_child("overall", section)
                check_n_append_child(section, subsection)
                check_n_append_child(subsection, id)
                check_n_add_parent(section, "overall")
                check_n_add_parent(subsection, section)
                check_n_add_parent(id, subsection)
                if subsection in base:
                    base[subsection][id] = base_val
                else:
                    base[subsection] = {id: base_val}

        return structure, base

    video_structure, video_base = get_structure_from(CSV_FOLDER_PATH + "videos.csv")
    problem_structure, problem_base = get_structure_from(CSV_FOLDER_PATH + "problems.csv")
    return {"video": video_structure, "problem": problem_structure}, {"video": video_base, "problem": problem_base}


def generate_students_data(course_structure, base):

    students = {}

    def get_student_data_from(filepath, category):

        def aggregate(l):
            return reduce(lambda a, b: [a[0] + b[0], a[1] + b[1]], l)

        def get_score(l):
            return round(float(l[0]) / l[1], 3)

        def get_donut(d):
            return {k: [get_score(x) for x in d[k]] for k in d}

        def get_report(d):
            return {k: get_score(aggregate(d[k])) for k in d}

        def update_data(category, current_student_id, current_student):
            if current_student_id in students and category in students[current_student_id]:
                student_temp = students[current_student_id][category]["donut"]
            else:
                if current_student_id not in students:
                    students[current_student_id] = {category: {}}
                else:
                    students[current_student_id][category] = {}
                student_temp = course_structure[category]["children"].copy()
            for key in student_temp:
                if key in current_student:
                    vals = [current_student[key][x] if x in current_student[key] else [0, base[category][key][x]] for x in student_temp[key]]
                elif key.startswith("lecture"):
                    vals = [[0, base[category][key][x]] for x in student_temp[key]]
                else:
                    vals = student_temp[key]
                student_temp[key] = vals
            for key in student_temp:
                if key.startswith("week"):
                    vals = [aggregate(student_temp[x]) for x in student_temp[key]]
                    student_temp[key] = vals
            student_temp["overall"] = [aggregate(student_temp[x]) for x in student_temp["overall"]]

            students[current_student_id][category]["donut"] = get_donut(student_temp)
            students[current_student_id][category]["report"] = get_report(student_temp)

        with open(filepath) as f:
            reader = csv.DictReader(f)
            current_student_id = 0
            current_student = {}
            for row in reader:
                student_id = int(clean(row["student_id"]))
                section = clean(row["section"])
                subsection = clean(row["subsection"])
                if "video_id" in row:
                    id = clean(row["video_id"])
                    score = [int(row["watched_seconds"]), int(row["duration_seconds"])]
                elif "problem_id" in row:
                    id = clean(row["problem_id"])
                    score = [int(row["score"]), int(row["max_points"])]

                if student_id == current_student_id:
                    # update current student
                    if subsection not in current_student:
                        current_student[subsection] = {id: score}
                    else:
                        current_student[subsection][id] = score

                else:
                    # put back in students
                    update_data(category, current_student_id, current_student)
                    # init new student
                    current_student_id = student_id
                    current_student = {subsection: {id: score}}
            # dont forget last student
            update_data(category, current_student_id, current_student)

    def fill_holes():

        def empty(d):
            return {"donut": {k: [0 for i in d[k]] for k in d}, "report": {k: 0 for k in d}}

        empty_problem = empty(course_structure["problem"]["children"])
        empty_video = empty(course_structure["video"]["children"])
        for student_id in students:
            if "problem" not in students[student_id]:
                students[student_id]["problem"] = empty_problem
            if "video" not in students[student_id]:
                students[student_id]["video"] = empty_video

    def get_peers():

        def add_list(l1, l2):
            return [l1[i] + l2[i] for i in range(len(l1))]

        def deep_add(a, b):
            result = {"video": {"report": {}, "donut": {}}, "problem": {"report": {}, "donut": {}}}
            for category in ["problem", "video"]:
                for result_type in ["report", "donut"]:
                    for key in a[category][result_type]:
                        x = a[category][result_type][key]
                        y = b[category][result_type][key]
                        if type(x) == float:
                            result[category][result_type][key] = x + y
                        elif type(x) == list:
                            result[category][result_type][key] = add_list(x, y)
            return result

        def deep_div(a, n):
            result = {"video": {"report": {}, "donut": {}}, "problem": {"report": {}, "donut": {}}}
            for category in ["problem", "video"]:
                for result_type in ["report", "donut"]:
                    for key in a[category][result_type]:
                        x = a[category][result_type][key]
                        if type(x) == float:
                            result[category][result_type][key] = round(x / n, 3)
                        elif type(x) == list:
                            result[category][result_type][key] = [round(e / n, 3) for e in x]
            return result

        def get_top10(students, category):
            return [{"id": y[0], "value":y[1][category]["report"]["overall"]} for y in sorted(students.items(), key=lambda x:-x[1][category]["report"]["overall"])][:10]

        def get_top10_time_from(filepath):
            timespent = defaultdict(int)
            active = defaultdict(int)
            with open(filepath) as f:
                reader = csv.DictReader(f)
                for row in reader:
                    student_id = int(row["student_id"])
                    minute = int(row["minutes_on_site"])
                    timespent[student_id] += minute
                    active[student_id] += int(minute > 15)  # number of days spending more than 15 mins

            def sort_n_transform(d):
                return [{"id": k, "value": v} for k, v in sorted(d.items(), key=lambda x: -x[1])[:10]]

            return sort_n_transform(timespent), sort_n_transform(active)

        top10_video = get_top10(students, "video")
        top10_problem = get_top10(students, "problem")
        top10_timespent, top10_active = get_top10_time_from(CSV_FOLDER_PATH + "minutes_per_day.csv")

        top10 = {"top10_video": top10_video,
                 "top10_problem": top10_problem,
                 "top10_active": top10_active,
                 "top10_timespent": top10_timespent}

        students["avg"] = deep_div(reduce(deep_add, students.values()), len(students))
        for k in top10:
            students[k] = deep_div(reduce(deep_add, {x["id"]: students[x["id"]] for x in top10[k]}.values()), 10)

        return top10

    get_student_data_from(CSV_FOLDER_PATH + "problem_attempts.csv", "problem")
    get_student_data_from(CSV_FOLDER_PATH + "video_views.csv", "video")
    fill_holes()
    top10 = get_peers()

    return students, top10


def generate_timeline_data(base):
    from datetime import date, timedelta as td

    def getdates(d1, d2):
        for i in range((d2 - d1).days + 1):
            date = str(d1 + td(days=i))
            yield [date, 0]

    dates_dict = dict(list(getdates(date(2018, 9, 15), date(2018, 12, 23))))
    timeline = defaultdict(dict)

    def empty_timeline():
        return [0] * len(dates_dict.keys())

    def get_timelime_data_from(filepath, category):
        with open(filepath) as f:
            reader = csv.DictReader(f)
            if category == "problem":
                score_colname, min_score = "score", 0
            elif category == "video":
                score_colname, min_score = "watched_seconds", 0
            else:
                score_colname, min_score = "minutes_on_site", 15
            date_colname = filter(lambda x: x.startswith("date"), reader.fieldnames)[0]
            for row in reader:
                score = int(row[score_colname])
                if score > min_score:
                    sid = row["student_id"]
                    date = row[date_colname]
                    if sid not in timeline:
                        timeline[sid] = {}
                    if category not in timeline[sid]:
                        timeline[sid][category] = dates_dict.copy()
                    timeline[sid][category][date] += score
        if category in ("problem", "video"):
            denom = sum([sum(base[category][lec].values()) for lec in base[category]])
            for sid in timeline:
                if category in timeline[sid]:
                    timeline[sid][category] = [v for k, v in sorted([(d, float(v) / denom) for d, v in timeline[sid][category].items()])]
                else:
                    timeline[sid][category] = empty_timeline()
        else:
            for sid in timeline:
                if category in timeline[sid]:
                    timeline[sid][category] = [int(v > 15) for d, v in sorted(timeline[sid][category].items())]
                else:
                    timeline[sid][category] = empty_timeline()

    def perday2accumulated(category):
        for sid in timeline:
            if category in timeline[sid]:
                val_current = 0
                result = []
                for v in timeline[sid][category]:
                    val_current += v
                    result.append(val_current)
                timeline[sid][category + "A"] = result
            else:
                timeline[sid][category] = empty_timeline()
                timeline[sid][category + "A"] = empty_timeline()

    def round_timeline_floats(categories):
        for sid in timeline:
            for category in categories:
                timeline[sid][category] = map(lambda x: round(x, 3) * 100, timeline[sid][category])

    def reformat():
        dates_list = sorted(dates_dict.keys())
        for sid in timeline:
            result = []
            for i in range(len(dates_list)):
                result.append({
                    "date": dates_list[i],
                    "problem": timeline[sid]['problemA'][i],
                    "problemPerDay": timeline[sid]['problem'][i],
                    "video": timeline[sid]['videoA'][i],
                    "videoPerDay": timeline[sid]['video'][i],
                    "active": timeline[sid]['active'][i]
                })
            timeline[sid] = result

    get_timelime_data_from(CSV_FOLDER_PATH + "problem_attempts.csv", "problem")
    get_timelime_data_from(CSV_FOLDER_PATH + "video_views.csv", "video")
    get_timelime_data_from(CSV_FOLDER_PATH + "minutes_per_day.csv", "active")
    perday2accumulated("problem")
    perday2accumulated("video")
    round_timeline_floats(["problem", "video", "problemA", "videoA"])
    reformat()

    return timeline


if __name__ == "__main__":
    cs, base = generate_course_structure()
    s, top10 = generate_students_data(cs, base)
    timeline = generate_timeline_data(base)
    with open("structure.json", "w") as fout:
        json.dump(cs, fout)
    with open("students.json", "w") as fout:
        json.dump(s, fout)
    with open("leaderboard.json", "w") as fout:
        json.dump(top10, fout)
    with open("timeline.json", "w") as fout:
        json.dump(timeline, fout)
