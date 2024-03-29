#version 410 core

in vec3 normal;
in vec4 fragPosEye;
in vec4 fragPosLightSpace;
in vec2 fragTexCoords;
in vec3 fragPos; // SPOTLIGHT - si in .vert

out vec4 fColor;

//lighting
uniform	mat3 normalMatrix;
uniform mat3 lightDirMatrix;
uniform	vec3 lightColor;
uniform	vec3 lightDir;
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;
uniform sampler2D shadowMap;

//CEATA
uniform int controlCeata;

vec3 ambient;
float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;
float shininess = 64.0f;


//LUMINA PUNCTIFORMA
uniform vec3 lightPosition; 
uniform int controlPunctiforma;

float constant=1.0f;
float linear =0.00225f;
float quadratic= 0.00375;

float ambientPoint = 0.5f;
float specularStrengthPoint = 0.5f;
float shininessPoint = 50.0f ;
//LUMINA PUNCTIFORMA


uniform mat4 view;

vec3 o;

vec3 computeLightComponents()//ca sa returneze ambient
{
	vec3 cameraPosEye = vec3(0.0f);//in eye coordinates, the viewer is situated at the origin

	//transform normal
	vec3 normalEye = normalize(normalMatrix * normal);

	//compute light direction
	vec3 lightDirN = normalize(lightDirMatrix * lightDir);

	//compute view direction
	vec3 viewDirN = normalize(cameraPosEye - fragPosEye.xyz);

	//compute half vector
	vec3 halfVector = normalize(lightDirN + viewDirN);

	//compute ambient light
	ambient = ambientStrength * lightColor * 4.0f;

	//compute diffuse light
	diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;

	//compute specular light
	float specCoeff = pow(max(dot(halfVector, normalEye), 0.0f), shininess);
	specular = specularStrength * specCoeff * lightColor;
	
	return (ambient+diffuse+specular);//
}

//PENTRU LUMINA PUNCTIFORMA
vec3 computePointLight(vec4 lightPosEye)
{
	vec3 cameraPosEye = vec3(0.0f);
	vec3 normalEye = normalize(normalMatrix * normal);
	vec3 lightDirN = normalize(lightPosEye.xyz - fragPosEye.xyz);
	vec3 viewDirN = normalize(cameraPosEye - fragPosEye.xyz);
	
	vec3 ambient = ambientPoint * lightColor;//AMBIENT * LIGHTCOLOR
	vec3 diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor; // DIFFUSE * LIGHTCOLOR
	
	vec3 halfVector = normalize(lightDirN + viewDirN);
	vec3 reflection = reflect(-lightDirN, normalEye);
	float specCoeff = pow(max(dot(normalEye, halfVector), 0.0f), shininessPoint);
	
	vec3 specular = specularStrengthPoint * specCoeff * lightColor;// SPECULAR * LIGHTCOLOR
	
	float distance = length(lightPosEye.xyz - fragPosEye.xyz);
	float att = 1.0f / (constant + linear * distance + quadratic * distance * distance);
	return (ambient + diffuse + specular) * att;
}


//foloseste frame buffer
float computeShadow()
{
	// perform perspective divide
    vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    if(normalizedCoords.z > 1.0f)
        return 0.0f;
    // Transform to [0,1] range
    normalizedCoords = normalizedCoords * 0.5f + 0.5f;
    // Get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
    float closestDepth = texture(shadowMap, normalizedCoords.xy).r;
    // Get depth of current fragment from light's perspective
    float currentDepth = normalizedCoords.z;
    // Check whether current frag pos is in shadow
    float bias = 0.005f;
    float shadow = currentDepth - bias> closestDepth  ? 1.0f : 0.0f;

    return shadow;
}
float computeFog()
{
	float fogDensity = 0.3f;//modific in functie de cum vreau sa arate fog-ul
	float fragmentDistance = length(fragPosEye);
	float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));
	return clamp(fogFactor, 0.0f, 1.0f);
}
void main()
{
	vec3 light = computeLightComponents();//lumina normala - de la light dir (lab)
	//aici se fac luminile ambient , specular , diffuse
	float shadow = computeShadow();
	
	float fogFactor = computeFog();// cat de densa e ceata
	vec4 fogColor = vec4(0.5f, 0.5f, 0.5f, 1.0f);//culoarea cetii
	
	//modulate with diffuse map
	ambient *= vec3(texture(diffuseTexture, fragTexCoords));
	diffuse *= vec3(texture(diffuseTexture, fragTexCoords));
	//modulate woth specular map
	specular *= vec3(texture(specularTexture, fragTexCoords));

	//view - camera uniform
	
	
	//LUMINA PUNCTIFORMA
	if(controlPunctiforma == 1)
	{
		vec4 lightPosEye = view * vec4(lightPosition, 1.0f);
		light += computePointLight(lightPosEye);
		vec4 diffuseColor = texture(diffuseTexture, fragTexCoords);
	}	
	//LUMINA PUNCTIFORMA
	
		
	
	//modulate with shadow - CULOARE PENTRU UMBRA
	vec3 color = min((ambient + (1.0f - shadow)*diffuse) + (1.0f - shadow)*specular, 1.0f);
	
	
	
	if(controlCeata==0)
	{
		fColor = vec4(color, 1.0f)*vec4(light,1.0f);
	}
	else{
		fColor = mix(fogColor, vec4(color,1.0f)*vec4(light,1.0f), fogFactor);
	}
	//fogColor - culoarea cetii si fogfactor cat e de densa
    //fColor = vec4(o, 1.0f);
}
