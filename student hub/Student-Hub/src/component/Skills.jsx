function Skills({ skillList }) {
    return (
       <ul>
            {skillList.map((skill, index) => (
                <li key={index}>{skill}</li>
            ))}
        </ul>
    );
}
export default Skills