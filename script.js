let tasksData = {};

const todo = document.querySelector("#todo");
const progress = document.querySelector("#inprogress");
const done = document.querySelector("#done");
const soundToggleButton=document.querySelector("#sound-toggle");

const completionAudio=new Audio("szaudio-christmas-holidays-short-266637.mp3");
completionAudio.preload="auto";

function playCompletionSound(){
  if(!soundEnabled){return;}
  completionAudio.currentTime=0;
  completionAudio.play().catch(()=>{});
}

let soundEnabled=JSON.parse(localStorage.getItem("soundEnabled"))??"true";

function updateSoundToggle(){
  soundToggleButton.textContent=soundEnabled?"Sound: On":"Sound: Off";
  soundToggleButton.classList.toggle("muted",!soundEnabled);
  soundToggleButton.setAttribute("aria-pressed",String(soundEnabled));
}

const columns = [todo, progress, done];

function addTask(title,desc,column){
    const div = document.createElement("div");
    div.classList.add("task");
    div.setAttribute("draggable", "true");

    div.innerHTML = `<h2>${title}</h2>
    <p>${desc}</p>
    <button>Delete</button>
    `;
    column.appendChild(div);
    div.addEventListener("drag",(e)=>{
        dragElement=div;
    });
    const deleteBtn=div.querySelector("button")
    deleteBtn.addEventListener("click",()=>{
        div.remove();
        updateTaskCount();
    })

    return div;
}

function updateTaskCount(){
    columns.forEach((coltask) => {
    const tasks = coltask.querySelectorAll(".task");
    const count = coltask.querySelector(".right");
    count.innerHTML = `Count : ${tasks.length}`;

    tasksData[coltask.id] = Array.from(tasks).map((t) => {
      return {
        title: t.querySelector("h2").innerText,
        desc: t.querySelector("p").innerText,
      };
    });

    localStorage.setItem("tasks", JSON.stringify(tasksData));
  });
}

if (localStorage.getItem("tasks")) {
  const data = JSON.parse(localStorage.getItem("tasks"));

  for (const col in data) {
    const column = document.querySelector(`#${col}`);
    data[col].forEach((task) => {
        addTask(task.title,task.desc,column);
    });

    updateTaskCount();
  }
}


//dragged element
let dragElement = null;

const tasks = document.querySelectorAll(".task");
tasks.forEach((task) => {
  task.addEventListener("drag", (e) => {
    dragElement = task;
  });
});

//function for drag and drop
function addDragEventOnColumn(column) {
  column.addEventListener("dragenter", (e) => {
    e.preventDefault();
    column.classList.add("hover-over");
  });
  column.addEventListener("dragleave", (e) => {
    e.preventDefault();
    column.classList.remove("hover-over");
  });
  column.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  column.addEventListener("drop", (e) => {
    e.preventDefault();
    const movedToDone=dragElement&&column.id==="done"&&dragElement.parentElement!==done;

    column.appendChild(dragElement);
    column.classList.remove("hover-over");
    
    updateTaskCount(); 

    if (movedToDone){
      playCompletionSound();
    }
  });
}

addDragEventOnColumn(todo);
addDragEventOnColumn(progress);
addDragEventOnColumn(done);

//adding new task (modal logic)
const toggleModalButton = document.querySelector("#toggle-modal");
const modal = document.querySelector(".modal");
const modalBg = document.querySelector(".modal .bg");
const addTaskButton = document.querySelector("#add-new-task");

updateSoundToggle();

soundToggleButton.addEventListener("click",()=>{
  soundEnabled=!soundEnabled;
  localStorage.setItem("soundEnabled",JSON.stringify(soundEnabled));
  updateSoundToggle();
  if(soundEnabled){
    playCompletionSound();
  }
})

toggleModalButton.addEventListener("click", () => {
  modal.classList.toggle("active");
});

modalBg.addEventListener("click", () => {
  modal.classList.remove("active");
});

addTaskButton.addEventListener("click", () => {
  const taskTitle = document.querySelector("#task-title").value;
  const taskDesc = document.querySelector("#task-description").value;

  if (!taskTitle) {
    alert("Task title is required.");
    return;
  }

  addTask(taskTitle,taskDesc,todo);

  updateTaskCount();

  modal.classList.remove("active");

  document.querySelector("#task-title").value ="";
  document.querySelector("#task-description").value ="";
});

//modal logic end
